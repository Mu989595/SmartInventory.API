namespace SmartInventory.Domain.Entities;

public class Alert : BaseEntity
{
    public int ProductId { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public bool IsActioned { get; set; } = false;

    // Navigation Property
    public Product Product { get; set; } = null!;
}

