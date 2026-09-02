using SmartInventory.Domain.Entities;

namespace SmartInventory.Application.Interfaces;

public interface IStockNotifier
{
    Task NotifyStockChangedAsync(Product product);
}
