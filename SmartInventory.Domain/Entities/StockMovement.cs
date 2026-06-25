// Entities/StockMovement.cs
using SmartInventory.Domain.Enums;

namespace SmartInventory.Domain.Entities;

public class StockMovement : BaseEntity
{
    public int ProductId { get; set; }
    public MovementType Type { get; set; }
    public int Quantity { get; set; }
    public string? Note { get; set; }
    public int CreatedBy { get; set; }

    // Navigation Property
    public Product Product { get; set; } = null!;
}