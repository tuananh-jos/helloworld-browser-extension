using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

// stdout phải ở binary mode để không mangle bytes
var stdin  = new BinaryReader(Console.OpenStandardInput());
var stdout = new BinaryWriter(Console.OpenStandardOutput());

// Ghi log ra file — theo dõi bằng terminal ngoài
var logPath = Path.Combine(Path.GetTempPath(), "hello_password_host.log");
var log = new StreamWriter(logPath, append: true, Encoding.UTF8) { AutoFlush = true };
log.WriteLine($"--- Session started {DateTime.Now:yyyy-MM-dd HH:mm:ss} ---");

while (true)
{
    try
    {
        // Đọc 4-byte length (little-endian) — Chrome Native Messaging protocol
        int length = stdin.ReadInt32();
        if (length == 0) break;

        byte[] bytes = stdin.ReadBytes(length);
        string json  = Encoding.UTF8.GetString(bytes);

        log.WriteLine($"[HelloPasswordHost] Received: {json}");

        var message = JsonSerializer.Deserialize<NativeMessage>(json);
        string response = ProcessMessage(message);

        // Ghi response: 4-byte length + JSON bytes
        byte[] responseBytes = Encoding.UTF8.GetBytes(response);
        stdout.Write(responseBytes.Length);
        stdout.Write(responseBytes);
        stdout.Flush();

        log.WriteLine($"[HelloPasswordHost] Sent: {response}");
    }
    catch (EndOfStreamException)
    {
        // Extension đã đóng kết nối
        break;
    }
    catch (Exception ex)
    {
        log.WriteLine($"[HelloPasswordHost] Error: {ex.Message}");
        break;
    }
}

static string ProcessMessage(NativeMessage? msg)
{
    if (msg?.Type == "PING")
    {
        var pong = new PongResponse
        {
            Message = "Hello from Win32!",
            Os      = Environment.OSVersion.VersionString,
            User    = Environment.UserName,
            Machine = Environment.MachineName,
            Time    = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
        };
        return JsonSerializer.Serialize(pong);
    }

    var error = new { type = "ERROR", message = $"Unknown type: {msg?.Type}" };
    return JsonSerializer.Serialize(error);
}

// ─── Models ──────────────────────────────────────────────────────────────────

class NativeMessage
{
    [JsonPropertyName("type")]
    public string? Type { get; set; }
}

class PongResponse
{
    [JsonPropertyName("type")]    public string Type    { get; set; } = "PONG";
    [JsonPropertyName("message")] public string Message { get; set; } = "";
    [JsonPropertyName("os")]      public string Os      { get; set; } = "";
    [JsonPropertyName("user")]    public string User    { get; set; } = "";
    [JsonPropertyName("machine")] public string Machine { get; set; } = "";
    [JsonPropertyName("time")]    public string Time    { get; set; } = "";
}
