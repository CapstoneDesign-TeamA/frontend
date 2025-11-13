import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
    const faqs = [
        {
            question: "계정은 어떻게 만드나요?",
            answer: "이메일 주소와 비밀번호만 있으면 간단하게 가입할 수 있습니다. 소셜 로그인도 지원 예정입니다.",
        },
        {
            question: "개인정보는 안전한가요?",
            answer: "모든 데이터는 암호화되어 안전하게 저장되며, 개인정보보호법을 준수합니다. 사용자의 동의 없이 정보를 공유하지 않습니다.",
        },
        {
            question: "앨범 용량 제한이 있나요?",
            answer: "베타 기간 중에는 그룹당 최대 1GB까지 무료로 제공됩니다. 향후 프리미엄 플랜에서 더 많은 용량을 제공할 예정입니다.",
        },
        {
            question: "그룹 초대는 어떻게 하나요?",
            answer: "초대 코드나 링크를 생성해서 카톡, 문자 등으로 공유하면 됩니다. 상대방이 링크를 클릭하면 바로 그룹에 참여할 수 있습니다.",
        },
        {
            question: "기존 캘린더와 연동되나요?",
            answer: "구글 캘린더, 애플 캘린더 연동 기능을 개발 중입니다.",
        },
    ];

    return (
        <section className="py-20">
            <div className="container max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        자주 묻는 질문
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        궁금한 점이 있으신가요?
                    </p>
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                    {faqs.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="bg-card rounded-lg px-6 border shadow-card"
                        >
                            <AccordionTrigger className="text-left font-semibold hover:no-underline">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
};

export default FAQ;
