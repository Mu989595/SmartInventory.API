// Entities/User.cs
using SmartInventory.Domain.Enums;

namespace SmartInventory.Domain.Entities;

public class User : BaseEntity
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.User;
    public bool IsActive { get; set; } = true;

    // Navigation Property
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
