"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FAQProps {
  language?: 'zh' | 'en'
}

export default function FAQ({ language = 'zh' }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqData = {
    zh: {
      title: "常见问题",
      subtitle: "关于 ColorOld AI 照片修复服务的常见问题解答",
      items: [
        {
          question: "ColorOld 支持哪些图片格式？",
          answer: "我们支持 JPG、JPEG 和 PNG 格式的图片。为了获得最佳效果，建议上传高质量的原图。文件大小限制为 8MB。"
        },
        {
          question: "AI 修复需要多长时间？",
          answer: "通常只需要 30-90 秒即可完成修复。处理时间取决于图片的复杂程度和服务器负载情况。我们的 FLUX AI 模型经过优化，能够快速处理大多数照片。"
        },
        {
          question: "修复效果如何保证？",
          answer: "我们使用最先进的 FLUX AI 模型，在大量历史照片数据上训练而成。虽然我们努力提供最佳效果，但修复质量可能因原图质量而异。如果不满意，您可以重新上传尝试。"
        },
        {
          question: "是否会保存我的照片？",
          answer: "为了保护您的隐私，我们不会永久保存您上传的照片。处理完成后，您的原图和修复图片会在 24 小时内自动删除。"
        },
        {
          question: "免费用户有使用限制吗？",
          answer: "是的，每个账户每月可免费使用 3 次。如需更多使用次数，请考虑升级到付费计划，享受无限制使用和优先处理。"
        },
        {
          question: "如何获得更好的修复效果？",
          answer: "建议上传清晰度较高的原图，避免过度模糊或损坏严重的照片。如果可能，请确保人脸部分相对清晰，这样 AI 能够更好地进行修复和上色。"
        }
      ]
    },
    en: {
      title: "Frequently Asked Questions",
      subtitle: "Common questions about ColorOld AI photo restoration service",
      items: [
        {
          question: "What image formats does ColorOld support?",
          answer: "We support JPG, JPEG, and PNG formats. For best results, we recommend uploading high-quality original images. File size limit is 8MB."
        },
        {
          question: "How long does AI restoration take?",
          answer: "Usually takes only 30-90 seconds to complete restoration. Processing time depends on image complexity and server load. Our FLUX AI model is optimized for fast processing of most photos."
        },
        {
          question: "How is the restoration quality guaranteed?",
          answer: "We use the state-of-the-art FLUX AI model trained on large amounts of historical photo data. While we strive to provide the best results, restoration quality may vary based on original image quality. You can re-upload and try again if unsatisfied."
        },
        {
          question: "Do you save my photos?",
          answer: "To protect your privacy, we don't permanently store your uploaded photos. After processing, both your original and restored images are automatically deleted within 24 hours."
        },
        {
          question: "Are there usage limits for free users?",
          answer: "Yes, each account can use the service 3 times per month for free. For more usage, please consider upgrading to a paid plan for unlimited use and priority processing."
        },
        {
          question: "How to get better restoration results?",
          answer: "We recommend uploading high-resolution original images, avoiding overly blurry or severely damaged photos. If possible, ensure facial areas are relatively clear so AI can better perform restoration and colorization."
        }
      ]
    }
  }

  const data = faqData[language]

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">
            {data.title}
          </h2>
          <p className="text-muted-foreground lg:text-xl max-w-3xl mx-auto">
            {data.subtitle}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {data.items.map((item, index) => (
              <div
                key={index}
                className="border rounded-2xl bg-card overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                <Button
                  onClick={() => toggleQuestion(index)}
                  variant="ghost"
                  className="w-full justify-between p-6 text-left h-auto font-medium text-base"
                >
                  <span className="pr-4">{item.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </Button>
                
                {openIndex === index && (
                  <div className="px-6 pb-6 pt-0">
                    <div className="text-muted-foreground leading-relaxed">
                      {item.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            {language === 'zh' ? '还有其他问题？' : 'Have more questions?'}
          </p>
          <Button variant="outline">
            {language === 'zh' ? '联系客服' : 'Contact Support'}
          </Button>
        </div>
      </div>
    </section>
  )
}