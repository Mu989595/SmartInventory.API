using Microsoft.AspNetCore.Mvc;
using SmartInventory.Application.Interfaces;

namespace SamrtInventory.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlertsController : ControllerBase
{
    private readonly IProductRepository _productRepository;

    public AlertsController(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    [HttpGet("stream")]
    public async Task StreamAlerts(CancellationToken cancellationToken)
    {
        // SSE headers
        Response.Headers["Content-Type"] = "text/event-stream";
        Response.Headers["Cache-Control"] = "no-cache";
        Response.Headers["Connection"] = "keep-alive";

        while (!cancellationToken.IsCancellationRequested)
        {
            // جيب المنتجات اللي مخزونها ناقص
            var lowStockProducts = await _productRepository.GetLowStockProductsAsync();

            foreach (var product in lowStockProducts)
            {
                var message = $"data: {{\"productId\": {product.Id}, \"name\": \"{product.Name}\", \"quantity\": {product.Quantity}, \"minQuantity\": {product.MinQuantity}}}\n\n";
                await Response.WriteAsync(message, cancellationToken);
                await Response.Body.FlushAsync(cancellationToken);
            }

             
            await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);
        }
    }
}