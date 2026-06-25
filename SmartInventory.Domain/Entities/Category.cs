namespace SmartInventory.Domain.Entities;

public class Category : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    
    // Navigation Property
    public ICollection<Product> Products { get; set; } = new List<Product>();
}