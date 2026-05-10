from langchain_core.tools import tool
import httpx
from .config import API_URL

@tool
def get_system_overview():
    """Returns a general overview of how the Impact Hub system works, including the business model and contribution types."""
    return (
        "O Impact Hub é um sistema de agendamento de espaços de impacto social. "
        "O modelo de negócio substitui o pagamento financeiro por contribuições sociais mensuráveis "
        "(doações, aulas gratuitas, conteúdo educativo). Cada reserva gera um impacto rastreável. "
        "Tipos de uso: cursos, eventos sociais, gravação de conteúdo. "
        "Tipos de contribuição: doação, impacto de tempo, impacto de conteúdo."
    )

@tool
def get_reputation_info():
    """Returns information about the reputation system and how users earn points."""
    return (
        "Os usuários constroem reputação através da validação de impacto. "
        "Completar um evento gera +10 pontos. Validar uma contribuição (ex: entrega de cestas básicas) gera +20 pontos. "
        "Se a reserva e a contribuição forem validadas, ganha-se +30 pontos extras de impacto. "
        "Reservas são bloqueadas se o score de reputação for negativo."
    )

@tool
async def calculate_equivalence(days: int, contribution_type: str):
    """
    Calculates the suggested quantity of a contribution based on the number of days and type.
    Args:
        days: Number of days for the reservation.
        contribution_type: One of 'donation', 'time_impact', 'content_impact'.
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{API_URL}/reservations/equivalence",
                params={"days": days, "type": contribution_type}
            )
            if response.status_code == 200:
                return response.json()
            return "Não foi possível calcular a equivalência no momento."
        except Exception as e:
            return f"Erro ao conectar com a API principal: {str(e)}"
