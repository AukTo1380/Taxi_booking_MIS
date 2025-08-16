import React, { useState, useRef, useEffect } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

const faqItems = [
  {
    question: "چطور می‌توانم موتر کرایه کنم؟",
    answer:
      "شما می‌توانید از طریق وبسایت ما موتر دلخواه‌تان را انتخاب کرده و فورم آنلاین را خانه‌پری کنید، یا با شماره تماس ما تماس بگیرید.",
  },
  {
    question: "آیا می‌توانم موتر را با راننده کرایه کنم؟",
    answer:
      "بلی، ما خدمات کرایه موتر با راننده را نیز ارائه می‌کنیم. هزینه آن بسته به نوع موتر و مدت زمان کرایه متفاوت است.",
  },
  {
    question: "مدارک لازم برای کرایه موتر چیست؟",
    answer:
      "برای کرایه موتر، شما نیاز به تذکره یا پاسپورت معتبر و گواهینامه رانندگی دارید. در برخی موارد، ضمانت نقدی نیز لازم است.",
  },
  {
    question: "آیا موترها بیمه دارند؟",
    answer:
      "بلی، تمام موترهای ما تحت پوشش بیمه می‌باشند. جزئیات بیمه هنگام قرارداد به شما توضیح داده می‌شود.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0); // First question open by default
  const contentRefs = useRef([]);

  const toggleIndex = (index) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  useEffect(() => {
    contentRefs.current.forEach((ref, index) => {
      if (ref) {
        if (openIndex === index) {
          ref.style.maxHeight = ref.scrollHeight + "px";
        } else {
          ref.style.maxHeight = "0px";
        }
      }
    });
  }, [openIndex]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-indigo-900 mb-4">
        سوالات متداول
      </h2>
      {faqItems.map((item, index) => (
        <div key={index} className="border-b border-gray-200 pb-4">
          <button
            onClick={() => toggleIndex(index)}
            className="flex justify-between items-center w-full text-right"
          >
            <h3 className="text-base font-semibold text-gray-900">
              {item.question}
            </h3>
            <span className="text-gray-500">
              {openIndex === index ? <FaMinus /> : <FaPlus />}
            </span>
          </button>

          <div
            ref={(el) => (contentRefs.current[index] = el)}
            className="overflow-hidden transition-all duration-300 ease-in-out mt-2 text-gray-600"
            style={{ maxHeight: openIndex === index ? "none" : "0px" }}
          >
            <p className="py-1">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQSection;
