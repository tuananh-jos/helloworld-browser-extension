using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Windows.ApplicationModel.AppService;
using Windows.Foundation.Collections;

var stdin  = new BinaryReader(Console.OpenStandardInput());
var stdout = new BinaryWriter(Console.OpenStandardOutput());

var logPath = Path.Combine(Path.GetTempPath(), "hello_password_host.log");
var log = new StreamWriter(logPath, append: true, Encoding.UTF8) { AutoFlush = true };
log.WriteLine($"--- Session started {DateTime.Now:yyyy-MM-dd HH:mm:ss} ---");

while (true)
{
    try
    {
        int length = stdin.ReadInt32();
        if (length == 0) break;

        byte[] bytes = stdin.ReadBytes(length);
        string json  = Encoding.UTF8.GetString(bytes);
        log.WriteLine($"[HelloPasswordHost] Received: {json}");

        string response = ForwardToUwp(json, log);

        byte[] responseBytes = Encoding.UTF8.GetBytes(response);
        stdout.Write(responseBytes.Length);
        stdout.Write(responseBytes);
        stdout.Flush();
        log.WriteLine($"[HelloPasswordHost] Sent: {response}");
    }
    catch (EndOfStreamException)
    {
        break;
    }
    catch (Exception ex)
    {
        log.WriteLine($"[HelloPasswordHost] Error: {ex.Message}");
        break;
    }
}

static string ForwardToUwp(string json, StreamWriter log)
{
    const string APP_SERVICE_NAME    = "com.hellopassword.appservice";
    const string PACKAGE_FAMILY_NAME = "eb882c1b-bf30-4a54-a52e-ea0bc80e0318_75cr2b68sm664";

    NativeMessage? msg;
    try { msg = JsonSerializer.Deserialize<NativeMessage>(json); }
    catch { return JsonSerializer.Serialize(new { type = "ERROR", message = "Invalid JSON from Chrome" }); }

    using var conn = new AppServiceConnection
    {
        AppServiceName    = APP_SERVICE_NAME,
        PackageFamilyName = PACKAGE_FAMILY_NAME
    };

    AppServiceConnectionStatus status;
    try
    {
        status = conn.OpenAsync().AsTask().GetAwaiter().GetResult();
    }
    catch (Exception ex)
    {
        log.WriteLine($"[HelloPasswordHost] OpenAsync exception: {ex.Message}");
        return JsonSerializer.Serialize(new { type = "ERROR", message = $"Connection exception: {ex.Message}" });
    }

    if (status != AppServiceConnectionStatus.Success)
    {
        log.WriteLine($"[HelloPasswordHost] UWP connection failed: {status}");
        return JsonSerializer.Serialize(new { type = "ERROR", message = $"UWP App Service unavailable: {status}" });
    }

    var request = new ValueSet { ["type"] = msg?.Type ?? "UNKNOWN" };

    AppServiceResponse result;
    try
    {
        result = conn.SendMessageAsync(request).AsTask().GetAwaiter().GetResult();
    }
    catch (Exception ex)
    {
        log.WriteLine($"[HelloPasswordHost] SendMessageAsync exception: {ex.Message}");
        return JsonSerializer.Serialize(new { type = "ERROR", message = $"Send exception: {ex.Message}" });
    }

    if (result.Status != AppServiceResponseStatus.Success)
    {
        log.WriteLine($"[HelloPasswordHost] UWP response failed: {result.Status}");
        return JsonSerializer.Serialize(new { type = "ERROR", message = $"UWP response error: {result.Status}" });
    }

    var dict = result.Message.ToDictionary(kv => kv.Key, kv => (object?)kv.Value);
    return JsonSerializer.Serialize(dict);
}

class NativeMessage
{
    [JsonPropertyName("type")]
    public string? Type { get; set; }
}
