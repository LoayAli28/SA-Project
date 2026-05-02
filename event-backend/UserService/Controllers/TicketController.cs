using Microsoft.AspNetCore.Mvc;
using Confluent.Kafka;
using System.Text.Json;

namespace UserService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TicketController : ControllerBase
    {
        [HttpPost("book")]
        public async Task<IActionResult> BookTicket([FromBody] Ticket ticket)
        {
            try
            {
                var config = new ProducerConfig
                {
                    BootstrapServers = "kafka:9092"
                };

                using var producer = new ProducerBuilder<Null, string>(config).Build();

                var message = new Message<Null, string>
                {
                    Value = JsonSerializer.Serialize(ticket)
                };

                await producer.ProduceAsync("TicketBooked", message);

                return Ok(new { message = "Ticket Booked and Event Sent", ticket });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    public class Ticket
    {
        public string Event { get; set; } = "";
        public string Seat { get; set; } = "";
        public string UserId { get; set; } = "";
    }
}