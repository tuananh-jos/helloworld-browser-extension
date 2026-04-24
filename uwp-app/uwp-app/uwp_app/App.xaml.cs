using System;
using Windows.ApplicationModel;
using Windows.ApplicationModel.Activation;
using Windows.ApplicationModel.AppService;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Navigation;

namespace uwp_app
{
    public sealed partial class App : Application
    {
        public App()
        {
            InitializeComponent();
            Suspending += OnSuspending;
        }

        protected override void OnLaunched(LaunchActivatedEventArgs e)
        {
            if (Window.Current.Content is not Frame rootFrame)
            {
                rootFrame = new Frame();
                rootFrame.NavigationFailed += OnNavigationFailed;
                Window.Current.Content = rootFrame;
            }

            if (e.PrelaunchActivated == false)
            {
                if (rootFrame.Content == null)
                    rootFrame.Navigate(typeof(MainPage), e.Arguments);

                Window.Current.Activate();
            }
        }

        protected override void OnBackgroundActivated(BackgroundActivatedEventArgs args)
        {
            base.OnBackgroundActivated(args);

            var deferral = args.TaskInstance.GetDeferral();
            if (args.TaskInstance.TriggerDetails is not AppServiceTriggerDetails details)
            {
                deferral.Complete();
                return;
            }

            var conn = details.AppServiceConnection;

            conn.RequestReceived += async (_, e) =>
            {
                var reqDeferral = e.GetDeferral();

                string msgType = e.Request.Message.TryGetValue("type", out var t) ? t as string ?? "?" : "?";

                if (MainPage.Current is MainPage page)
                    await page.LogAsync($"Received: {msgType}");

                string userName;
                try { userName = Environment.UserName; }
                catch { userName = "UWP User"; }

                var resp = new ValueSet
                {
                    ["type"]    = "UWP_PONG",
                    ["message"] = "Hello from UWP!",
                    ["os"]      = Environment.OSVersion.VersionString,
                    ["user"]    = userName,
                    ["machine"] = Environment.MachineName,
                    ["time"]    = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
                };

                await e.Request.SendResponseAsync(resp);

                if (MainPage.Current is MainPage p)
                    await p.LogAsync("Sent: UWP_PONG");

                reqDeferral.Complete();
            };

            conn.ServiceClosed += (_, _) => deferral.Complete();
        }

        void OnNavigationFailed(object sender, NavigationFailedEventArgs e)
        {
            throw new Exception("Failed to load Page " + e.SourcePageType.FullName);
        }

        private void OnSuspending(object sender, SuspendingEventArgs e)
        {
            var deferral = e.SuspendingOperation.GetDeferral();
            deferral.Complete();
        }
    }
}
