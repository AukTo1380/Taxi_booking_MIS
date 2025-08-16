import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const WhyChooseUs = () => {
  const features = [
    "راهنمایی تخصصی",
    "پشتیبانی رایگان مشتری",
    "قیمت مناسب",
    "رزرو آسان و سریع",
    "راهنمایی تخصصی",
    "پشتیبانی رایگان مشتری",
    "محل‌های متعدد برای سوار شدن",
    "بدون انتظار طولانی",
  ];

  return (
    <section dir="rtl" className="py-16 bg-white text-gray-800">
      <div className="max-w-[95%] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center px-6">
        {/* Left Images */}
        <div className="flex gap-6 justify-center">
          <img
            src="/choose3.jpg"
            alt="موتر تاکسی"
            className="max-h-[400px]  rounded-lg shadow-lg"
          />
          <img
            src="/choose1.jpg"
            alt="موتر مدرن"
            className="max-h-[400px] mt-10 rounded-lg shadow-lg"
          />
        </div>

        {/* Right Text */}
        <div>
          <h2 className="text-4xl font-bold mb-4">
            چرا{" "}
            <span className="text-primary relative inline-block">
              ما را انتخاب کنید؟
              {/* <span className="absolute left-0 right-0 -bottom-1 h-3 bg-amber-200 opacity-60 rounded-full"></span> */}
            </span>
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            ما بهترین خدمات کرایه موتر را با کیفیت عالی، سرعت بالا و پشتیبانی
            کامل برای شما فراهم می‌کنیم.
          </p>

          {/* Feature List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <CheckCircleIcon className="w-5 h-5 text-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
