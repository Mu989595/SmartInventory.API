namespace SmartInventory.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public int Quantity { get; set; } = 0;
    public int MinQuantity { get; set; } = 10;
    public decimal UnitPrice { get; set; }

    // Navigation Properties
    public Category Category { get; set; } = null!;
    public ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
    public ICollection<Alert> Alerts { get; set; } = new List<Alert>();
}