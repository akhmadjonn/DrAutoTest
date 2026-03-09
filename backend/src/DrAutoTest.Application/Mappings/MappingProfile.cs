using AutoMapper;
using DrAutoTest.Application.DTOs.Auth;
using DrAutoTest.Application.DTOs.Categories;
using DrAutoTest.Application.DTOs.Exams;
using DrAutoTest.Application.DTOs.Progress;
using DrAutoTest.Application.DTOs.Questions;
using DrAutoTest.Application.DTOs.Subscriptions;
using DrAutoTest.Domain.Entities;

namespace DrAutoTest.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.PhoneNumber))
            .ForMember(dest => dest.SubscriptionStatus, opt => opt.Ignore());

        CreateMap<Category, CategoryDto>()
            .ForMember(dest => dest.QuestionCount, opt => opt.MapFrom(src => src.Questions.Count))
            .ForMember(dest => dest.SubCategories, opt => opt.MapFrom(src => src.SubCategories));

        CreateMap<CreateCategoryRequest, Category>();

        CreateMap<Question, QuestionDto>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
            .ForMember(dest => dest.Answers, opt => opt.MapFrom(src => src.Answers));

        CreateMap<CreateQuestionRequest, Question>()
            .ForMember(dest => dest.Answers, opt => opt.Ignore());

        CreateMap<UpdateQuestionRequest, Question>()
            .ForMember(dest => dest.Answers, opt => opt.Ignore());

        CreateMap<Answer, AnswerDto>();

        CreateMap<CreateAnswerRequest, Answer>();

        CreateMap<Exam, ExamDto>()
            .ForMember(dest => dest.Questions, opt => opt.MapFrom(src => src.ExamQuestions));

        CreateMap<ExamQuestion, ExamQuestionDto>()
            .ForMember(dest => dest.QuestionText, opt => opt.MapFrom(src => src.Question.Text))
            .ForMember(dest => dest.QuestionImageUrl, opt => opt.MapFrom(src => src.Question.ImageUrl))
            .ForMember(dest => dest.Explanation, opt => opt.MapFrom(src => src.Question.Explanation))
            .ForMember(dest => dest.Answers, opt => opt.MapFrom(src => src.Question.Answers));

        CreateMap<SubscriptionPlan, SubscriptionPlanDto>();

        CreateMap<Subscription, SubscriptionDto>()
            .ForMember(dest => dest.PlanName, opt => opt.MapFrom(src => src.Plan.Name))
            .ForMember(dest => dest.DaysRemaining, opt => opt.MapFrom(src =>
                Math.Max(0, (int)(src.ExpiresAt - DateTime.UtcNow).TotalDays)));

        CreateMap<UserProgress, CategoryProgressDto>()
            .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => src.Question.CategoryId))
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Question.Category.Name));
    }
}
