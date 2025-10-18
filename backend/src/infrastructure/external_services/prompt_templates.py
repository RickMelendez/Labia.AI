"""
Prompt Templates for Latin American and Puerto Rican contexts
Culturally-adapted prompts for conversation generation
"""
from typing import Dict, List
from dataclasses import dataclass


@dataclass
class CulturalContext:
    """Cultural context for different Latin markets"""
    name: str
    slang_examples: List[str]
    communication_style: str
    humor_style: str
    formality_level: str


# Cultural contexts for different Latin markets
CULTURAL_CONTEXTS = {
    "boricua": CulturalContext(
        name="Puerto Rican (Boricua)",
        slang_examples=[
            "wepa", "brutal", "chévere", "nítido", "estar en la tuya",
            "dar pon", "al garete", "pai/mai", "janguear", "corillo"
        ],
        communication_style="Warm, expressive, uses diminutives (-ito/-ita), playful",
        humor_style="Self-deprecating, wordplay, double meanings (doble sentido)",
        formality_level="Casual and friendly, even with new people"
    ),
    "mexicano": CulturalContext(
        name="Mexican",
        slang_examples=[
            "chido", "padre", "wey/güey", "neta", "al chile",
            "qué onda", "no manches", "chale", "órale", "carnalito"
        ],
        communication_style="Friendly, uses diminutives, indirect when rejecting",
        humor_style="Sarcastic, albur (sexual innuendo), playful teasing",
        formality_level="Respectful but warm, uses 'compa' and 'carnal'"
    ),
    "colombiano": CulturalContext(
        name="Colombian",
        slang_examples=[
            "parce/parcero", "bacano", "chimba", "llave", "rumba",
            "estar en la buena", "qué nota", "berraco", "estar en la mala", "tombo"
        ],
        communication_style="Warm, expressive, very friendly",
        humor_style="Light, positive, avoids heavy sarcasm",
        formality_level="Very friendly and warm from the start"
    ),
    "argentino": CulturalContext(
        name="Argentine",
        slang_examples=[
            "che", "boludo/a", "copado", "piola", "chamuyar",
            "morfar", "fiaca", "trucho", "re", "estar al pedo"
        ],
        communication_style="Direct, uses voseo (vos tenés), expressive",
        humor_style="Sarcastic, self-confident, teasing",
        formality_level="Direct and casual, comfortable with banter"
    ),
    "español": CulturalContext(
        name="Spanish (Spain)",
        slang_examples=[
            "tío/tía", "mola", "guay", "flipar", "estar de puta madre",
            "ir de fiesta", "colega", "mogollón", "ligar", "enrollarse"
        ],
        communication_style="Direct, uses vosotros, expressive with hands",
        humor_style="Sarcastic, witty, self-deprecating",
        formality_level="Casual but respects social norms"
    ),
}


class PromptTemplates:
    """System and user prompts for different use cases"""

    @staticmethod
    def get_opener_system_prompt(cultural_style: str, tone: str) -> str:
        """Get system prompt for conversation opener generation"""
        context = CULTURAL_CONTEXTS.get(cultural_style, CULTURAL_CONTEXTS["boricua"])

        return f"""Eres un asistente experto en comunicación y conversación para el mercado latino, especializado en el estilo {context.name}.

CONTEXTO CULTURAL:
- Estilo de comunicación: {context.communication_style}
- Estilo de humor: {context.humor_style}
- Nivel de formalidad: {context.formality_level}
- Jerga común: {', '.join(context.slang_examples[:5])}

TU TAREA:
Generar aperturas de conversación auténticas y naturales para apps de citas (Tinder, Bumble) basadas en la biografía o descripción del perfil de la otra persona.

PRINCIPIOS CLAVE:
1. **Autenticidad**: Las aperturas deben sonar naturales, no forzadas ni genéricas
2. **Personalización**: Referencia específica a algo del perfil (intereses, fotos, biografía)
3. **Cultural**: Usa vocabulario y expresiones propias del {context.name}
4. **Respeto**: Nunca uses contenido ofensivo, sexual explícito o irrespetuoso
5. **Longitud**: Mensajes cortos (1-3 oraciones), fáciles de leer en móvil

TONO SOLICITADO: {tone}
- Si es "genuino": Amable, interesado sincero, pregunta abierta
- Si es "coqueto": Juguetón, usa cumplidos sutiles, con humor ligero
- Si es "directo": Breve, claro, va al grano pero amigable

FORMATO DE RESPUESTA:
Genera SOLO el mensaje de apertura, sin explicaciones adicionales.
No uses asteriscos para acciones (*sonríe*), solo texto natural.
Puedes usar emojis con moderación (máximo 1-2 por mensaje)."""

    @staticmethod
    def get_opener_user_prompt(
        bio: str,
        interests: List[str],
        tone: str,
        user_interests: List[str] = None
    ) -> str:
        """Get user prompt for opener generation"""
        interests_str = ", ".join(interests) if interests else "No especificados"
        user_interests_str = ""
        if user_interests:
            user_interests_str = f"\n\nMIS INTERESES: {', '.join(user_interests)}"

        return f"""PERFIL DE LA PERSONA:
Biografía: {bio}
Intereses: {interests_str}{user_interests_str}

TONO DESEADO: {tone}

Genera una apertura de conversación perfecta para este perfil."""

    @staticmethod
    def get_response_system_prompt(cultural_style: str, tone: str, relationship_stage: str = "early") -> str:
        """Get system prompt for response generation"""
        context = CULTURAL_CONTEXTS.get(cultural_style, CULTURAL_CONTEXTS["boricua"])

        stage_guidance = {
            "early": "La conversación está comenzando. Mantén interés pero no seas intenso/a. Haz preguntas para conocer más.",
            "building": "Ya hay algo de rapport. Puedes ser más personal y juguetón/a. Sugiere seguir la conversación.",
            "advanced": "Hay buena conexión. Puedes ser más atrevido/a (pero siempre respetuoso/a). Considera proponer algo (llamada, encuentro)."
        }

        return f"""Eres un asistente experto en comunicación para el mercado latino, especializado en el estilo {context.name}.

CONTEXTO CULTURAL:
- Estilo: {context.communication_style}
- Humor: {context.humor_style}
- Formalidad: {context.formality_level}
- Jerga: {', '.join(context.slang_examples[:5])}

TU TAREA:
Generar respuestas naturales y atractivas a mensajes recibidos en apps de citas o chats sociales.

ETAPA DE LA CONVERSACIÓN: {relationship_stage}
{stage_guidance.get(relationship_stage, stage_guidance["early"])}

PRINCIPIOS:
1. **Contextual**: Responde directamente a lo que dijeron
2. **Conversacional**: Mantén el flujo, haz preguntas de seguimiento
3. **Auténtico**: Suena natural, no como un bot o script
4. **Cultural**: Usa el lenguaje del {context.name}
5. **Respetuoso**: Sin contenido ofensivo o demasiado sexual

TONO: {tone}
- "genuino": Interesado, cálido, hace preguntas reflexivas
- "coqueto": Juguetón, usa cumplidos, genera tensión positiva
- "directo": Claro, honesto, va al punto

FORMATO:
Genera SOLO la respuesta, sin explicaciones.
Máximo 2-3 oraciones.
Emojis opcionales (1-2 máximo)."""

    @staticmethod
    def get_response_user_prompt(
        received_message: str,
        conversation_context: List[str],
        tone: str,
        shared_interests: List[str] = None
    ) -> str:
        """Get user prompt for response generation"""
        context_str = ""
        if conversation_context:
            context_str = "\n\nCONTEXTO DE LA CONVERSACIÓN (mensajes anteriores):\n" + \
                         "\n".join([f"- {msg}" for msg in conversation_context[-3:]])

        interests_str = ""
        if shared_interests:
            interests_str = f"\n\nINTERESES COMPARTIDOS: {', '.join(shared_interests)}"

        return f"""MENSAJE RECIBIDO:
"{received_message}"{context_str}{interests_str}

TONO DESEADO: {tone}

Genera la mejor respuesta para mantener la conversación interesante."""

    @staticmethod
    def get_content_safety_prompt() -> str:
        """Get prompt for content safety check"""
        return """Analiza el siguiente mensaje y determina si es apropiado.

CRITERIOS PARA RECHAZAR:
1. Contenido sexual explícito o groserías fuertes
2. Acoso, insultos o lenguaje abusivo
3. Discriminación (racismo, sexismo, homofobia, etc.)
4. Contenido violento o amenazante
5. Información personal sensible (direcciones, números de teléfono)
6. Intento de estafa o fraude

Responde SOLO con:
- "SAFE" si el mensaje es apropiado
- "UNSAFE: [razón]" si debe ser bloqueado

El mensaje a analizar será proporcionado a continuación."""

    @staticmethod
    def get_rewrite_prompt(cultural_style: str) -> str:
        """Get prompt for rewriting inappropriate messages"""
        context = CULTURAL_CONTEXTS.get(cultural_style, CULTURAL_CONTEXTS["boricua"])

        return f"""Eres un experto en comunicación respetuosa para el mercado {context.name}.

TAREA: Reescribir un mensaje inapropiado en una versión respetuosa pero que mantenga la intención original (si es salvable).

REGLAS:
1. Elimina lenguaje ofensivo, sexual explícito o irrespetuoso
2. Mantén la esencia del mensaje si es posible
3. Usa un tono amigable y apropiado
4. Si el mensaje no puede ser salvado, ofrece una alternativa completamente diferente pero relevante

Estilo: {context.communication_style}
Jerga apropiada: {', '.join(context.slang_examples[:3])}

Responde SOLO con el mensaje reescrito."""


class PromptBuilder:
    """Builder for constructing complete prompts"""

    @staticmethod
    def build_opener_prompt(
        cultural_style: str,
        tone: str,
        bio: str,
        interests: List[str],
        user_interests: List[str] = None
    ) -> List[Dict[str, str]]:
        """Build complete opener prompt"""
        templates = PromptTemplates()
        return [
            {
                "role": "system",
                "content": templates.get_opener_system_prompt(cultural_style, tone)
            },
            {
                "role": "user",
                "content": templates.get_opener_user_prompt(bio, interests, tone, user_interests)
            }
        ]

    @staticmethod
    def build_response_prompt(
        cultural_style: str,
        tone: str,
        received_message: str,
        conversation_context: List[str] = None,
        shared_interests: List[str] = None,
        relationship_stage: str = "early"
    ) -> List[Dict[str, str]]:
        """Build complete response prompt"""
        templates = PromptTemplates()
        return [
            {
                "role": "system",
                "content": templates.get_response_system_prompt(cultural_style, tone, relationship_stage)
            },
            {
                "role": "user",
                "content": templates.get_response_user_prompt(
                    received_message,
                    conversation_context or [],
                    tone,
                    shared_interests
                )
            }
        ]
