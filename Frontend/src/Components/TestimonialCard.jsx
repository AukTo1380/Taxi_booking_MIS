import { useState } from "react";
import { ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";

export default function TestimonialCard() {
  const [active, setActive] = useState(0);

  const testimonials = [
    {
      name: "احمد خان",
      role: "مشتری راضی",
      text: `خدمات کرایه موتر بسیار عالی بود. ماشین‌ها نو و تمیز بودند و راننده‌ها با احترام و حرفه‌ای رفتار کردند. من حتماً دوباره از این خدمات استفاده خواهم کرد.
      
      از نحوه‌ی رزرو گرفته تا تحویل موتر، همه چیز بسیار ساده و سریع انجام شد. قیمت‌ها هم بسیار منصفانه است و ارزش پول را دارد. این شرکت واقعاً قابل اعتماد است و من همیشه به دوستان و خانواده‌ام توصیه می‌کنم.`,
      image: "profile_img_1.png",
    },
    {
      name: "مریم احمدی",
      role: "مشتری خوشحال",
      text: `تجربه کرایه موتر برایم بسیار خوب بود. رزرو آسان و قیمت مناسب بود. موتر به موقع تحویل داده شد و سفرم را آسان ساخت.
      
      راننده مودب و حرفه‌ای بود و ماشین در وضعیت بسیار خوبی قرار داشت. خدمات پشتیبانی نیز در طول سفر بسیار کمک‌کننده بودند و به هر سوالی پاسخ دادند. قطعاً در آینده دوباره از این خدمات استفاده خواهم کرد.`,
      image: "profile_img_2.png",
    },
    {
      name: "حسین صالحی",
      role: "مشتری وفادار",
      text: `خدمات کرایه موتر این شرکت همیشه قابل اعتماد بوده است. خودروها جدید و در وضعیت عالی هستند و پشتیبانی مشتریان بسیار سریع و مؤثر است.
      
      از زمان شروع همکاری تا پایان سفر، تجربه‌ای راحت و بی‌دردسر داشتم. تیم پشتیبانی همیشه آماده پاسخگویی بود و در مواقع ضروری سریع عمل کردند. با خیال راحت می‌توانم این شرکت را به همه کسانی که دنبال کرایه موتر هستند توصیه کنم.`,
      image: "profile_img_3.png",
    },
  ];

  // Handlers for next/prev buttons
  const prevTestimonial = () => {
    setActive((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const nextTestimonial = () => {
    setActive((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-14 relative">
      <div className="w-full bg-white min-h-[90vh] flex  overflow-hidden ">
        {/* Right Image Section */}
        <div className="relative bg-primary w-[330px] p-6 flex items-center justify-center">
          <img
            src={`review-cover.png`}
            alt={"review-cover"}
            className="w-[500px] h-[500px] absolute -translate-y-1/2 z-10 top-1/2 -left-1/2 object-cover rounded-xl"
          />
        </div>

        {/* Left Text Section - Slider */}
        <div className="flex-1 relative bg-gradient-to-l from-secondary/50 flex flex-col justify-center px-12 py-10">
          {/* Testimonial Content */}
          <div className="max-w-3xl mx-auto text-right select-text">
            <div className="flex items-center gap-x-4 mb-8">
              <img
                src={testimonials[active].image}
                alt="avatar"
                className="w-20 h-20 rounded-full object-cover border border-gray-300"
              />
              <div>
                <h2 className="text-2xl font-Ray_black text-black">
                  {testimonials[active].name}
                </h2>
                <p className="text-primary font-semibold uppercase text-sm">
                  {testimonials[active].role}
                </p>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg mb-10">
              {testimonials[active].text}
            </p>

            {/* Navigation Buttons */}
            <div className=" absolute top-1/2 -translate-y-1/2 left-16 flex flex-col items-center gap-y-5 mb-6">
              <button
                onClick={prevTestimonial}
                aria-label="قبلی"
                className="p-1 rounded-full bg-yellow-400 hover:bg-yellow-500 transition"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextTestimonial}
                aria-label="بعدی"
                className="p-1 rounded-full bg-yellow-400 hover:bg-yellow-500 transition"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Dots Navigation */}
            <div className="flex justify-center gap-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActive(index)}
                  className={`w-4 h-4 rounded-full border-2 ${
                    active === index
                      ? "border-yellow-500 bg-yellow-500"
                      : "border-gray-400 bg-transparent"
                  } transition`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
