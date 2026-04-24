using System;
using System.Threading.Tasks;
using Windows.UI.Core;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;

namespace uwp_app
{
    public sealed partial class MainPage : Page
    {
        internal static MainPage? Current { get; private set; }

        public MainPage()
        {
            InitializeComponent();
            Current = this;
            _ = LogAsync("App Service ready.");
        }

        internal async Task LogAsync(string message)
        {
            await Dispatcher.RunAsync(CoreDispatcherPriority.Normal, () =>
            {
                LogList.Items.Insert(0, $"[{DateTime.Now:HH:mm:ss}] {message}");
            });
        }

        private void OnClearClick(object sender, RoutedEventArgs e)
        {
            LogList.Items.Clear();
        }
    }
}
