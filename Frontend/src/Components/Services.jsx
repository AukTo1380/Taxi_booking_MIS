import React from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { ArrowLeftIcon } from "lucide-react";

const servicesData = [
  {
    id: 1,
    title: "شراکت در سفر",
    description: "با همسفر شدن هزینه‌ها را کاهش دهید و سفر راحتی داشته باشید.",
    icon: "https://cdn-icons-png.flaticon.com/512/2830/2830304.png", // replace with your SVG or icon path
    image: "/serv1.png", // replace with actual image path
  },
  {
    id: 2,
    title: "اشتراک تاکسی",
    description:
      "تاکسی را با دیگران شریک شوید و در زمان و هزینه صرفه‌جویی کنید.",
    icon: "https://cdn-icons-png.flaticon.com/512/3097/3097136.png", // replace with your SVG or icon path
    image: "/serv2.png", // replace with actual image path
  },
  {
    id: 2,
    title: "اشتراک تاکسی",
    description:
      "تاکسی را با دیگران شریک شوید و در زمان و هزینه صرفه‌جویی کنید.",
    icon: "https://cdn-icons-png.flaticon.com/512/3097/3097136.png", // replace with your SVG or icon path
    image: "/serv3.png", // replace with actual image path
  },
];

const Services = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold mb-4">خدمات محبوب ما</h2>
            <p className="text-gray-600 max-w-2xl">
              بهترین خدمات کرایه موتر با کیفیت عالی، پشتیبانی کامل و قیمت مناسب
              برای شما فراهم است.
            </p>
          </div>
          <button className="bg-primary hover:bg-primary/50 text-white px-6 py-3 rounded-lg flex items-center gap-2 mt-6 md:mt-0 transition">
            دریافت خدمات
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Services List */}
        <div className="space-y-8">
          {servicesData.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-200 p-6 flex flex-col md:flex-row items-center md:items-center gap-6"
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <img
                  src={service.icon}
                  alt={service.title}
                  className="w-8 h-8"
                />
              </div>

              {/* Text */}
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>

              {/* Button */}
              <div className="flex-shrink-0">
                <button className="bg-primary hover:bg-primary/50 text-white px-5 py-2 rounded-lg flex items-center gap-2">
                  <ArrowRightIcon className="w-4 h-4" />
                  مشاهده جزئیات
                </button>
              </div>

              {/* Image */}
              <div className="flex-shrink-0 w-full md:w-48">
                <img
                  src={service.image}
                  alt={service.title}
                  className="rounded-lg w-full h-28 object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
