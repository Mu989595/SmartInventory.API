using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace SamrtInventory.API.Hubs;

[Authorize]
public class StockHub : Hub
{
    public const string StockWatchersGroup = "StockWatchers";

    public override async Task OnConnectedAsync()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, StockWatchersGroup);
        await base.OnConnectedAsync();
    }
}
