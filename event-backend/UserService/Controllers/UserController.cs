using Microsoft.AspNetCore.Mvc;
using Confluent.Kafka;
using System.Text.Json;
using MongoDB.Driver;

namespace UserService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        // Connection string inside Docker network
        private const string MongoConnectionString = "mongodb://user-db:27017";

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
           
            Console.WriteLine($"[DEBUG] Registering user: {user.Email}");

            try
            {
                // connect to monogo (users)
                var client = new MongoClient(MongoConnectionString);
                var database = client.GetDatabase("users"); 

                // 2. Collection users
                var collection = database.GetCollection<User>("users");

                // 3. use await before response
                await collection.InsertOneAsync(user);
                Console.WriteLine("[DEBUG] Data saved successfully to MongoDB (users.users)");

                // 4. send to kafka (Background Task)
                _ = Task.Run(async () =>
                {
                    try
                    {
                        var config = new ProducerConfig { BootstrapServers = "kafka:9092", MessageTimeoutMs = 5000 };
                        using var producer = new ProducerBuilder<Null, string>(config).Build();
                        var message = new Message<Null, string> { Value = JsonSerializer.Serialize(user) };
                        await producer.ProduceAsync("UserRegistered", message);
                        Console.WriteLine("[DEBUG] Kafka event sent successfully.");
                    }
                    catch (Exception kex)
                    {
                        Console.WriteLine($"[KAFKA ERROR] {kex.Message}");
                    }
                });

                return Ok(new { message = "Success", user });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CRITICAL ERROR] {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
        }
    }

    // Class User 
    public class User
    {
        [MongoDB.Bson.Serialization.Attributes.BsonId]
        [MongoDB.Bson.Serialization.Attributes.BsonIgnoreIfDefault]
        [MongoDB.Bson.Serialization.Attributes.BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
        public string? Id { get; set; }

        [MongoDB.Bson.Serialization.Attributes.BsonElement("email")]
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
        public string Name { get; set; } = "";
    }
}