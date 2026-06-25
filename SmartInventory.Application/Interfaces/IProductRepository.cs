// IProductRepository.cs
using SmartInventory.Domain.Entities;

namespace SmartInventory.Application.Interfaces;

public interface IProductRepository : IGenericRepository<Product>
{
    Task<Product?> GetBySkuAsync(string sku);
    Task<IEnumerable<Product>> GetLowStockProductsAsync();
}