// ProductRepository.cs
using Microsoft.EntityFrameworkCore;
using SmartInventory.Application.Exceptions;
using SmartInventory.Application.Interfaces;
using SmartInventory.Domain.Entities;
using SmartInventory.Infrastructure.Data;

namespace SmartInventory.Infrastructure.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _context;

    public ProductRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Product>> GetAllAsync()
        => await _context.Products.Include(p => p.Category).ToListAsync();

    public async Task<Product?> GetByIdAsync(int id)
        => await _context.Products.Include(p => p.Category)
                                  .FirstOrDefaultAsync(p => p.Id == id);

    public async Task<Product?> GetBySkuAsync(string sku)
        => await _context.Products.FirstOrDefaultAsync(p => p.SKU == sku);

    public async Task<IEnumerable<Product>> GetLowStockProductsAsync()
        => await _context.Products
                         .Where(p => p.Quantity <= p.MinQuantity)
                         .ToListAsync();

    public async Task AddAsync(Product entity)
    {
        await _context.Products.AddAsync(entity);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Product entity)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        _context.Products.Update(entity);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var product = await GetByIdAsync(id);
        if (product is null) return;
        product.IsDeleted = true;
        await _context.SaveChangesAsync();
    }

    public async Task<Product> DecrementStockAsync(int productId, int quantity, uint expectedRowVersion)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId);
        if (product is null)
            throw new KeyNotFoundException($"Product {productId} not found.");

        if (product.Quantity < quantity)
            throw new InvalidOperationException("Insufficient stock.");

        _context.Entry(product).Property(p => p.RowVersion).OriginalValue = expectedRowVersion;

        product.Quantity -= quantity;
        product.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConcurrencyConflictException(
                $"Product {productId} was modified by another request. Please retry with the latest data.");
        }

        return product;
    }
}
