using DrAutoTest.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DrAutoTest.Infrastructure.Persistence.Configurations;

public class ExamQuestionConfiguration : IEntityTypeConfiguration<ExamQuestion>
{
    public void Configure(EntityTypeBuilder<ExamQuestion> builder)
    {
        builder.ToTable("exam_questions");

        builder.HasKey(eq => eq.Id);

        builder.HasIndex(eq => eq.ExamId);
        builder.HasIndex(eq => new { eq.ExamId, eq.QuestionId }).IsUnique();

        builder.HasOne(eq => eq.Question)
            .WithMany()
            .HasForeignKey(eq => eq.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(eq => eq.SelectedAnswer)
            .WithMany()
            .HasForeignKey(eq => eq.SelectedAnswerId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
