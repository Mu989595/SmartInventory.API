using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartInventory.Application.Interfaces;
using SmartInventory.Domain.Entities;

namespace SamrtInventory.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IProductRepository _productRepository;
    private readonly ICacheService _cacheService;
    private const string ProductsCacheKey = "products:all";

    public ProductsController(IProductRepository productRepository, ICacheService cacheService)
    {
        _productRepository = productRepository;
        _cacheService = cacheService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        // check the cache first 
        var cached = await _cacheService.GetAsync<IEnumerable<Product>>(ProductsCacheKey);
        if (cached is not null)
            return Ok(cached); 

        var products = await _productRepository.GetAllAsync();

        await _cacheService.SetAsync(ProductsCacheKey, products, TimeSpan.FromMinutes(5));

        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var cacheKey = $"products:{id}";

        var cached = await _cacheService.GetAsync<Product>(cacheKey);
        if (cached is not null)
            return Ok(cached);

        var product = await _productRepository.GetByIdAsync(id);
        if (product is null)
            return NotFound();

        await _cacheService.SetAsync(cacheKey, product, TimeSpan.FromMinutes(5));
        return Ok(product);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(Product product)
    {
        await _productRepository.AddAsync(product);

    
        await _cacheService.RemoveAsync(ProductsCacheKey);

        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, Product product)
    {
        product.Id = id;
        await _productRepository.UpdateAsync(product);

        // Cache Invalidation
        await _cacheService.RemoveAsync(ProductsCacheKey);
        await _cacheService.RemoveAsync($"products:{id}");

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        await _productRepository.DeleteAsync(id);

        // Cache Invalidation
        await _cacheService.RemoveAsync(ProductsCacheKey);
        await _cacheService.RemoveAsync($"products:{id}");

        return NoContent();
    }
}