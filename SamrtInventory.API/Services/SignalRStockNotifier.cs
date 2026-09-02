using Microsoft.AspNetCore.SignalR;
using SamrtInventory.API.Hubs;
using SmartInventory.Application.DTOs;
using SmartInventory.Application.Interfaces;
using SmartInventory.Domain.Entities;

namespace SamrtInventory.API.Services;

public class SignalRStockNotifier : IStockNotifier
{
    private readonly IHubContext<StockHub> _hubContext;

    public SignalRStockNotifier(IHubContext<StockHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyStockChangedAsync(Product product)
    {
        var update = new StockUpdateDto
        {
            ProductId = product.Id,
            ProductName = product.Name,
            NewQuantity = product.Quantity,
            IsLowStock = product.Quantity <= product.MinQuantity,
            UpdatedAt = product.UpdatedAt
        };

        await _hubContext.Clients
            .Group(StockHub.StockWatchersGroup)
            .SendAsync("StockChanged", update);
    }
}
