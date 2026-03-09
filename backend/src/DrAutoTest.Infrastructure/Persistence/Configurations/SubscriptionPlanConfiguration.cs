using DrAutoTest.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DrAutoTest.Infrastructure.Persistence.Configurations;

public class SubscriptionPlanConfiguration : IEntityTypeConfiguration<SubscriptionPlan>
{
    public void Configure(EntityTypeBuilder<SubscriptionPlan> builder)
    {
        builder.ToTable("subscription_plans");

        builder.HasKey(sp => sp.Id);

        builder.Property(sp => sp.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(sp => sp.Description)
            .HasMaxLength(1000);

        builder.Property(sp => sp.Price)
            .HasPrecision(18, 2);

        builder.Property(sp => sp.Features)
            .HasMaxLength(4000);

        builder.HasIndex(sp => sp.IsActive);
        builder.HasIndex(sp => sp.DisplayOrder);
    }
}
