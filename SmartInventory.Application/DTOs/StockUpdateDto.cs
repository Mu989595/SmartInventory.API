namespace SmartInventory.Application.DTOs;

public class StockUpdateDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int NewQuantity { get; set; }
    public bool IsLowStock { get; set; }
    public DateTime UpdatedAt { get; set; }
}
