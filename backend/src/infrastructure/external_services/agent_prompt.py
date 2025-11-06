"""
Agent Assistant Prompt Builder
Generates messages for a helpful in-app assistant (coach/guide) adapted by country style.
"""
from typing import List, Dict, Optional


REGIONAL_RULES = {
    "boricua": "Usa 1-2 expresiones boricuas (wepa, brutal, janguear) con respeto y evita jergas de otros países.",
    "mexicano": "Usa 1-2 mexicanismos (wey, chido, neta, no manches) y evita jergas de otros países.",
    "colombiano": "Usa 1-2 colombianismos (parce, bacano, chimba) y evita jergas de otros países.",
    "argentino": "Usa voseo (vos, tenés) y 1-2 argentinismos (che, copado, chamuyar).",
    "español": "Usa español peninsular (tío/tía, mola, guay) y evita jergas americanas.",
}


def build_agent_messages(
    cultural_style: str,
    mode: str,
    query: str,
    conversation_context: Optional[List[str]] = None,
    goal: Optional[str] = None,
) -> List[Dict[str, str]]:
    """Build LLM chat messages for assistant guidance."""
    style = REGIONAL_RULES.get(cultural_style, "Adapta léxico y registro al país indicado.")
    mode_rules = {
        "coach": "Sé directo pero amable. Refuerza confianza. Evita listas largas; da pasos concretos (1-3).",
        "ideas": "Propón 3-5 ideas originales y accionables. Evita clichés.",
        "rewrite": "Reescribe 3 versiones más naturales, breves y con buen gusto.",
        "troubleshoot": "Detecta el problema y da 2-3 soluciones concretas con ejemplos.",
    }
    mode_text = mode_rules.get(mode, "Sé útil, específico y breve (máx 3 puntos).")

    system = (
        "Eres un asistente experto en comunicación social y dating para el mercado latino. "
        "Responde con ejemplos reales, naturales y culturalmente adaptados. "
        "Sin contenido ofensivo ni sexual explícito. "
        f"DIFERENCIACIÓN POR PAÍS: {style} "
        f"MODO: {mode_text}"
    )

    context_block = "\n\nCONVERSACIÓN PREVIA:\n- " + "\n- ".join(conversation_context or []) if conversation_context else ""
    user = (
        f"Consulta del usuario: {query.strip()}\n" + (f"Objetivo: {goal}\n" if goal else "") + context_block
    )

    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]

