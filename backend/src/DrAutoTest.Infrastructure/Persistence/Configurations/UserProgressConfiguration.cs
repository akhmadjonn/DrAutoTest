using DrAutoTest.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DrAutoTest.Infrastructure.Persistence.Configurations;

public class UserProgressConfiguration : IEntityTypeConfiguration<UserProgress>
{
    public void Configure(EntityTypeBuilder<UserProgress> builder)
    {
        builder.ToTable("user_progress");

        builder.HasKey(up => up.Id);

        builder.HasIndex(up => new { up.UserId, up.QuestionId }).IsUnique();
        builder.HasIndex(up => up.UserId);

        builder.HasOne(up => up.Question)
            .WithMany()
            .HasForeignKey(up => up.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
