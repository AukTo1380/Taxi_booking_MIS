import React from "react";

const steps = [
  {
    id: "01",
    title: "ایجاد حساب کاربری",
    description:
      "حساب کاربری خود را بسازید تا بتوانید به تمام خدمات ما دسترسی داشته باشید.",
  },
  {
    id: "02",
    title: "یافتن تاکسی",
    description: "در هر زمان و مکانی تاکسی دلخواه خود را به راحتی پیدا کنید.",
  },
  {
    id: "03",
    title: "ملاقات با راننده",
    description: "راننده خود را ملاقات کرده و برای سفر آماده شوید.",
  },
  {
    id: "04",
    title: "لذت بردن از سفر",
    description: "از سفری راحت، ایمن و سریع لذت ببرید.",
  },
];

const HowToGetStarted = () => {
  return (
    <section dir="rtl" className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold">
            چگونه{" "}
            <span className="text-primary relative inline-block">
              شروع کنید
              <span className="absolute -bottom-1 left-0 w-full h-2 bg-yellow-200 -z-10"></span>
            </span>
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            تنها با چند مرحله ساده می‌توانید از خدمات ما استفاده کنید.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="relative bg-secondary p-6 rounded-lg text-center"
            >
              {/* Step Number */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-primary text-white font-bold py-2 px-4 rounded-t-lg">
                {step.id}
              </div>

              {/* Step Content */}
              <h3 className="font-bold text-lg mt-4">{step.title}</h3>
              <p className="text-gray-600 mt-2 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowToGetStarted;
