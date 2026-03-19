"""
AI Service - High-level interface for conversation generation
Handles opener and response generation with cultural context
"""
from typing import List, Optional, Dict
from loguru import logger

from .llm_provider import BaseLLMProvider, LLMMessage
from .agent_prompt import build_agent_messages
# Use the improved, research-backed prompt templates for more genuine, culturally-tuned outputs
from .prompt_templates_improved import PromptBuilder


class ConversationOpener:
    """Generated conversation opener with metadata"""

    def __init__(
        self,
        text: str,
        tone: str,
        cultural_style: str,
        confidence: float = 0.0
    ):
        self.text = text
        self.tone = tone
        self.cultural_style = cultural_style
        self.confidence = confidence


class ConversationResponse:
    """Generated conversation response with metadata"""

    def __init__(
        self,
        text: str,
        tone: str,
        cultural_style: str,
        follow_up_suggestion: Optional[str] = None
    ):
        self.text = text
        self.tone = tone
        self.cultural_style = cultural_style
        self.follow_up_suggestion = follow_up_suggestion


class AIConversationService:
    """Service for AI-powered conversation generation"""

    def __init__(self, llm_provider: BaseLLMProvider):
        self.llm = llm_provider
        logger.info("Initialized AI Conversation Service")

    async def generate_openers(
        self,
        bio: str,
        interests: List[str],
        cultural_style: str = "boricua",
        target_tone: Optional[str] = None,
        user_interests: List[str] = None,
        num_suggestions: int = 5
    ) -> List[ConversationOpener]:
        """
        Generate conversation openers in three different tones

        Args:
            bio: Target person's bio/description
            interests: Target person's interests
            cultural_style: Cultural context (boricua, mexicano, etc.)
            user_interests: User's own interests for finding common ground
            num_suggestions: Number of suggestions per tone (default 3 = 1 per tone)

        Returns:
            List of ConversationOpener objects with different tones
        """
        openers: List[ConversationOpener] = []
        tones = ["genuino", "coqueto", "directo"]

        # Distribute suggestions across tones (at least 1 per tone), then fill remaining favoring genuino/coqueto
        base_per_tone = 1
        remaining = max(num_suggestions - len(tones), 0)
        # Favor the UI-selected tone when distributing extras
        _tone_map = {"chill": "genuino", "elegant": "directo", "minimalist": "directo", "playero": "coqueto", "intellectual": "genuino"}
        _preferred = _tone_map.get((target_tone or "").lower())
        extra_order = ([
            _preferred,
            *[t for t in tones if t != _preferred],
        ] if _preferred in tones else ["genuino", "coqueto", "directo"])
        counts = {t: base_per_tone for t in tones}
        for i in range(remaining):
            counts[extra_order[i % len(extra_order)]] += 1

        for tone_key in tones:
            try:
                prompt_messages = PromptBuilder.build_opener_prompt(
                    cultural_style=cultural_style,
                    tone=tone_key,
                    bio=bio,
                    interests=interests,
                    user_interests=user_interests
                )

                # Convert to LLMMessage objects
                llm_messages = [
                    LLMMessage(role=msg["role"], content=msg["content"])
                    for msg in prompt_messages
                ]
                # Add tone-aware persona for responses
                _persona_by_tone_resp = {
                    "genuino": "PERSONA: Auténtico y empático. 1–3 frases cortas que avancen la conversación con curiosidad.",
                    "coqueto": "PERSONA: Juguetón con clase. Toque coqueto breve y una invitación ligera.",
                    "directo": "PERSONA: Claro y seguro. Responde al punto y propone siguiente paso sin presión.",
                }
                llm_messages.insert(1, LLMMessage(role="system", content=_persona_by_tone_resp.get(tone_key, _persona_by_tone_resp["genuino"])) )
                # Add tone-aware persona guidance
                _persona_by_tone = {
                    "genuino": "PERSONA: Auténtico, curioso y seguro. Conecta con algo del perfil y haz una pregunta corta.",
                    "coqueto": "PERSONA: Coqueto con clase. Juega ligero, un guiño, cero cursilería.",
                    "directo": "PERSONA: Directo y de alto valor. Claro, breve y con intención, sin ser agresivo.",
                }
                llm_messages.insert(1, LLMMessage(role="system", content=_persona_by_tone.get(tone_key, _persona_by_tone["genuino"])) )

                # Persona guidance (high-value, confident, natural; avoid clichÃ©s)
                llm_messages.insert(1, LLMMessage(
                    role="system",
                    content=(
                        "PERSONA: High-value, confident, playful-but-respectful masculine voice. "
                        "Avoid cheesy or generic lines. Keep it natural with a curiosity hook."
                    )
                ))

                # Generate multiple openers per tone
                n = counts[tone_key]
                texts = await self.llm.generate_multiple(
                    messages=llm_messages,
                    n=n,
                    temperature=0.9,
                    max_tokens=120
                )

                for t in texts:
                    if not t:
                        continue
                    openers.append(
                        ConversationOpener(
                            text=t.strip(),
                            tone=tone_key,
                            cultural_style=cultural_style,
                            confidence=0.9
                        )
                    )

                logger.info(f"Generated {tone_key} opener for {cultural_style} style")

            except Exception as e:
                logger.error(f"Error generating {tone_key} opener: {e}")
                # Add fallback opener
                openers.append(self._get_fallback_opener(tone_key, cultural_style))

        # Rank, dedupe, and take top-N
        seen = set()
        ranked: list[tuple[float, ConversationOpener]] = []
        for op in openers:
            txt = op.text.strip()
            key = txt.lower()
            if key in seen:
                continue
            seen.add(key)
            score = self._score_text(txt, cultural_style, op.tone, set((interests or [])))
            ranked.append((score, op))
        ranked.sort(key=lambda x: x[0], reverse=True)
        return [op for _, op in ranked[:num_suggestions]]

    async def generate_responses(
        self,
        received_message: str,
        cultural_style: str = "boricua",
        conversation_context: List[str] = None,
        shared_interests: List[str] = None,
        relationship_stage: str = "early",
        num_suggestions: int = 5,
        target_tone: Optional[str] = None
    ) -> List[ConversationResponse]:
        """
        Generate conversation responses in different tones

        Args:
            received_message: The message to respond to
            cultural_style: Cultural context
            conversation_context: Previous messages for context
            shared_interests: Common interests to reference
            relationship_stage: Stage of relationship (early, building, advanced)
            num_suggestions: Number of responses to generate

        Returns:
            List of ConversationResponse objects
        """
        responses: List[ConversationResponse] = []
        tones = ["genuino", "coqueto", "directo"]

        tone_map = {"chill": "genuino", "elegant": "directo", "minimalist": "directo", "playero": "coqueto", "intellectual": "genuino"}
        preferred = tone_map.get((target_tone or "").lower())
        base_per_tone = 1
        remaining = max(num_suggestions - len(tones), 0)
        counts = {t: base_per_tone for t in tones}
        order = [preferred] + [t for t in tones if t != preferred] if preferred in tones else tones
        for i in range(remaining):
            counts[order[i % len(order)]] += 1

        for tone_key in tones:
            try:
                prompt_messages = PromptBuilder.build_response_prompt(
                    cultural_style=cultural_style,
                    tone=tone_key,
                    received_message=received_message,
                    conversation_context=conversation_context,
                    shared_interests=shared_interests,
                    relationship_stage=relationship_stage
                )

                # Convert to LLMMessage objects
                llm_messages = [
                    LLMMessage(role=msg["role"], content=msg["content"])
                    for msg in prompt_messages
                ]

                # Persona guidance (high-value, authentic; avoid generic lists)
                llm_messages.insert(1, LLMMessage(
                    role="system",
                    content=(
                        "PERSONA: High-value, seguro y auténtico. 1-3 short sentences to move the chat forward. "
                        "Avoid generic replies and long lists."
                    )
                ))

                # Generate multiple responses per tone
                n = counts[tone_key]
                texts = await self.llm.generate_multiple(
                    messages=llm_messages,
                    n=n,
                    temperature=0.85,
                    max_tokens=180
                )

                for t in texts:
                    if not t:
                        continue
                    responses.append(
                        ConversationResponse(
                            text=t.strip(),
                            tone=tone_key,
                            cultural_style=cultural_style
                        )
                    )

                logger.info(f"Generated {tone_key} response for {cultural_style} style")

            except Exception as e:
                logger.error(f"Error generating {tone_key} response: {e}")
                # Add fallback response
                responses.append(self._get_fallback_response(tone_key, cultural_style))

        seen = set()
        ranked_resp: list[tuple[float, ConversationResponse]] = []
        for r in responses:
            txt = r.text.strip()
            key = txt.lower()
            if key in seen:
                continue
            seen.add(key)
            score = self._score_text(txt, cultural_style, r.tone, set((shared_interests or [])))
            ranked_resp.append((score, r))
        ranked_resp.sort(key=lambda x: x[0], reverse=True)
        return [r for _, r in ranked_resp[:num_suggestions]]

    def _score_text(self, text: str, cultural_style: str, tone: str, interest_words: set[str]) -> float:
        """Heuristic scoring: brevity, curiosity, relevance, light country flavor."""
        t = (text or '').strip()
        length = len(t)
        score = 0.0
        if 40 <= length <= 200:
            score += 1.0
        elif 15 <= length < 40:
            score += 0.6
        if '?' in t:
            score += 0.5
        flavor = {
            'boricua': ['wepa', 'brutal', 'jangue'],
            'mexicano': ['wey', 'chido', 'neta'],
            'colombiano': ['parce', 'bacano', 'chimba'],
            'argentino': ['che', 'copado', 'vos'],
            'espanol': ['tio', 'mola', 'guay'],
        }
        for w in flavor.get(cultural_style, []):
            if w in t.lower():
                score += 0.4
                break
        words = set(t.lower().replace('\n', ' ').split())
        iw = set(w.lower() for w in interest_words if isinstance(w, str))
        if words.intersection(iw):
            score += 0.6
        if not t.lower().startswith('hola'):
            score += 0.2
        if t.count('ðŸ˜Š') + t.count('ðŸ˜') + t.count('ðŸ˜‰') > 2:
            score -= 0.3
        return score

    async def check_content_safety(self, text: str) -> Dict[str, any]:
        """
        Check if content is safe and appropriate

        Args:
            text: Text to check

        Returns:
            Dict with 'is_safe' boolean and optional 'reason' for unsafe content
        """
        from .prompt_templates_improved import PromptTemplates

        try:
            messages = [
                LLMMessage(role="system", content=PromptTemplates.get_content_safety_prompt()),
                LLMMessage(role="user", content=f"Mensaje a analizar:\n\n{text}")
            ]

            result = await self.llm.generate(
                messages=messages,
                temperature=0.3,  # Lower temperature for more consistent safety checks
                max_tokens=100
            )

            result = result.strip().upper()

            if result.startswith("SAFE"):
                return {"is_safe": True}
            elif result.startswith("UNSAFE"):
                reason = result.replace("UNSAFE:", "").strip()
                return {"is_safe": False, "reason": reason}
            else:
                # Uncertain - default to safe but log
                logger.warning(f"Unclear safety check result: {result}")
                return {"is_safe": True}

        except Exception as e:
            logger.error(f"Error in content safety check: {e}")
            # Default to safe on errors to not block users
            return {"is_safe": True}

    async def rewrite_inappropriate_message(
        self,
        text: str,
        cultural_style: str = "boricua"
    ) -> str:
        """
        Rewrite an inappropriate message to be respectful

        Args:
            text: Original inappropriate text
            cultural_style: Cultural context for rewrite

        Returns:
            Rewritten appropriate message
        """
        from .prompt_templates_improved import PromptTemplates

        try:
            messages = [
                LLMMessage(role="system", content=PromptTemplates.get_rewrite_prompt(cultural_style)),
                LLMMessage(role="user", content=f"Mensaje a reescribir:\n\n{text}")
            ]

            rewritten = await self.llm.generate(
                messages=messages,
                temperature=0.7,
                max_tokens=200
            )

            return rewritten.strip()

        except Exception as e:
            logger.error(f"Error rewriting message: {e}")
            return "Hola, Â¿cÃ³mo estÃ¡s? Me gustarÃ­a conocerte mejor."

    def _get_fallback_opener(self, tone: str, cultural_style: str) -> ConversationOpener:
        """Get fallback opener when generation fails"""
        fallbacks = {
            "genuino": "Hola! Vi tu perfil y me pareciÃ³ interesante. Â¿CÃ³mo estuvo tu dÃ­a?",
            "coqueto": "Â¡Ey! Tu perfil me llamÃ³ la atenciÃ³n ðŸ‘€ Â¿QuÃ© tal si nos conocemos?",
            "directo": "Hola, me gustÃ³ tu perfil. Â¿Te gustarÃ­a chatear?"
        }

        text = fallbacks.get(tone, fallbacks["genuino"])

        return ConversationOpener(
            text=text,
            tone=tone,
            cultural_style=cultural_style,
            confidence=0.5
        )

    def _get_fallback_response(self, tone: str, cultural_style: str) -> ConversationResponse:
        """Get fallback response when generation fails"""
        fallbacks = {
            "genuino": "Â¡QuÃ© interesante! CuÃ©ntame mÃ¡s sobre eso.",
            "coqueto": "Me gusta cÃ³mo piensas ðŸ˜ Â¿QuÃ© mÃ¡s puedes contarme?",
            "directo": "Entiendo. Â¿Y tÃº quÃ© opinas?"
        }

        text = fallbacks.get(tone, fallbacks["genuino"])

        return ConversationResponse(
            text=text,
            tone=tone,
            cultural_style=cultural_style
        )

    async def generate_match_questions(
        self,
        user1_profile: dict,
        user2_profile: dict,
        num_questions: int = 4
    ) -> list:
        """
        Generate AI-powered compatibility questions for a new match.

        Args:
            user1_profile: {name, age, interests, bio, cultural_style}
            user2_profile: same structure
            num_questions: number of questions to generate (default 4)

        Returns:
            List of dicts: [{"id": "q1", "text": "..."}, ...]
        """
        fallback = [
            {"id": "q1", "text": "¿Cuál es tu comida favorita y qué dice eso de ti?"},
            {"id": "q2", "text": "¿A dónde irías de viaje si pudieras mañana mismo?"},
            {"id": "q3", "text": "¿Qué haces en tu tiempo libre que más te define?"},
            {"id": "q4", "text": "¿Cuál es el valor más importante en una relación para ti?"},
        ]

        try:
            # Find shared interests for context
            interests1 = set(user1_profile.get("interests") or [])
            interests2 = set(user2_profile.get("interests") or [])
            shared = list(interests1 & interests2)

            system_msg = (
                "Eres un matchmaker creativo para una app de citas latinoamericana. "
                "Genera preguntas personales y reveladoras para dos personas que acaban de hacer match. "
                "Las preguntas deben: ser específicas a sus intereses, revelar personalidad y valores, "
                "estar en español con tono cálido y juguetón, NO ser de entrevista formal. "
                f"Responde SOLO con JSON válido: [{{'\"id\":\"q1\",\"text\":\"...\"'}}, ...]"
            )

            user_msg = (
                f"Usuario A: Nombre={user1_profile.get('name')}, "
                f"Edad={user1_profile.get('age')}, "
                f"Intereses={user1_profile.get('interests')}, "
                f"Bio={user1_profile.get('bio') or 'no especificada'}\n\n"
                f"Usuario B: Nombre={user2_profile.get('name')}, "
                f"Edad={user2_profile.get('age')}, "
                f"Intereses={user2_profile.get('interests')}, "
                f"Bio={user2_profile.get('bio') or 'no especificada'}\n\n"
                f"Intereses en común: {shared if shared else 'ninguno todavía'}\n\n"
                f"Genera exactamente {num_questions} preguntas que revelen compatibilidad. "
                "Responde SOLO con el array JSON."
            )

            messages = [
                LLMMessage(role="system", content=system_msg),
                LLMMessage(role="user", content=user_msg),
            ]

            raw = await self.llm.generate(messages=messages, temperature=0.85, max_tokens=400)
            raw = raw.strip()

            # Extract JSON array from response
            import json, re
            json_match = re.search(r'\[.*\]', raw, re.DOTALL)
            if json_match:
                questions = json.loads(json_match.group())
                # Validate structure
                valid = [
                    {"id": q.get("id", f"q{i+1}"), "text": q.get("text", "")}
                    for i, q in enumerate(questions)
                    if isinstance(q, dict) and q.get("text")
                ]
                if len(valid) >= 3:
                    return valid[:num_questions]

            logger.warning("Could not parse match questions from LLM, using fallback")
            return fallback[:num_questions]

        except Exception as e:
            logger.error(f"Error generating match questions: {e}")
            return fallback[:num_questions]

    async def assist(
        self,
        query: str,
        cultural_style: str = "boricua",
        mode: str = "coach",
        conversation_context: List[str] | None = None,
        goal: str | None = None,
        n: int = 3,
    ) -> List[str]:
        try:
            msgs = build_agent_messages(
                cultural_style=cultural_style,
                mode=mode,
                query=query,
                conversation_context=conversation_context,
                goal=goal,
            )
            llm_messages = [LLMMessage(role=m["role"], content=m["content"]) for m in msgs]
            texts = await self.llm.generate_multiple(messages=llm_messages, n=max(1, n), temperature=0.8, max_tokens=220)
            return [t.strip() for t in texts if t]
        except Exception as e:
            logger.error(f"Assistant error: {e}")
            return [
                "Puedo ayudarte con ideas, mejores respuestas o reescrituras mÃ¡s naturales. "
                "CuÃ©ntame el contexto y tu objetivo."
            ]


