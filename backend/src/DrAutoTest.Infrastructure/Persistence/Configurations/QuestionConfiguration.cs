using DrAutoTest.Domain.Entities;
using DrAutoTest.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DrAutoTest.Infrastructure.Persistence.Configurations;

public class QuestionConfiguration : IEntityTypeConfiguration<Question>
{
    public void Configure(EntityTypeBuilder<Question> builder)
    {
        builder.ToTable("questions");

        builder.HasKey(q => q.Id);

        builder.Property(q => q.Text)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(q => q.ImageUrl)
            .HasMaxLength(500);

        builder.Property(q => q.Explanation)
            .HasMaxLength(2000);

        builder.Property(q => q.Difficulty)
            .HasConversion<string>()
            .HasMaxLength(10);

        builder.HasIndex(q => q.CategoryId);
        builder.HasIndex(q => q.IsActive);
        builder.HasIndex(q => q.Difficulty);

        builder.HasMany(q => q.Answers)
            .WithOne(a => a.Question)
            .HasForeignKey(a => a.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
