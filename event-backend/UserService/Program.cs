using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

// 1. Configure MongoDB Connection
// Note: "user-db" is the service name defined in your docker-compose.yml
var mongoClient = new MongoClient("mongodb://user-db:27017");
var database = mongoClient.GetDatabase("users");

// Register the MongoDB Database as a Singleton service
builder.Services.AddSingleton(database);

// 2. Configure CORS Policy
// This allows the React Frontend (port 3000) to communicate with this API
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Add standard Controller services
builder.Services.AddControllers();

// Configure Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 3. Enable CORS middleware
// This must be placed after builder.Build() and before MapControllers()
app.UseCors();

// Configure the HTTP request pipeline
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "User API V1");
    c.RoutePrefix = string.Empty; // Set Swagger UI at the app's root
});

app.UseHttpsRedirection();
app.UseAuthorization();

// Map controller routes
app.MapControllers();

app.Run();