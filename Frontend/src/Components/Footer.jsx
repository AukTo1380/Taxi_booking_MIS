import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";


const Footer = () => {
  return (
    <footer
      className="bg-secondary text-white"
      aria-labelledby="footer-heading"
      dir="rtl"
    >
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-6 lg:px-8 lg:py-12">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* بخش اول - لوگو و توضیحات */}
          <div className="space-y-4 md:space-y-8 xl:col-span-1">
            <Link to="/" className="flex items-center gap-x-5">
              <p className="text-4xl font-Ray_black text-black">YouRide</p>
            </Link>
            <p className="text-base text-black">
              کرایه موتر آسان و سریع، با بهترین قیمت و کیفیت. موتر دلخواه خود را
              از هر شهر که می‌خواهید انتخاب و رزرو کنید.
            </p>
            <div className="flex justify-center md:justify-start space-x-6 space-x-reverse">
              <a href="#" className="text-black hover:text-white">
                <span className="sr-only">فېسبوک</span>
                <Facebook />
              </a>
              <a href="#" className="text-black hover:text-white">
                <span className="sr-only">انستاگرام</span>
                <Instagram />
              </a>
              <a href="#" className="text-black hover:text-white">
                <span className="sr-only">توییتر</span>
                <Twitter />
              </a>
            </div>
          </div>

          {/* بخش دوم - لینک‌ها */}
          <div className="mt-12 md:grid md:grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid flex justify-between md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-lg font-Ray_black text-black tracking-wider uppercase">
                  صفحات
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <Link
                      to="/"
                      className="text-base text-black hover:text-black/50"
                    >
                      صفحه اصلی
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/about"
                      className="text-base text-black hover:text-black/50"
                    >
                      درباره ما
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/cities"
                      className="text-base text-black hover:text-black/50"
                    >
                      شهرها
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="text-base text-black hover:text-black/50"
                    >
                      تماس با ما
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-Ray_black text-black tracking-wider uppercase">
                  خدمات
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  <li>
                    <a
                      href="#"
                      className="text-base text-black hover:text-black/50"
                    >
                      کرایه موتر روزانه
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-base text-black hover:text-black/50"
                    >
                      کرایه موتر ماهانه
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-base text-black hover:text-black/50"
                    >
                      کرایه با راننده
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* بخش سوم - خبرنامه */}
            <div className="mt-6 md:mt-0 md:grid md:grid-cols-1 md:gap-8">
              <div>
                <h3 className="text-lg font-Ray_black text-black tracking-wider uppercase">
                  عضویت در خبرنامه
                </h3>
                <p className="mt-4 text-base text-black">
                  تازه‌ترین پیشنهادات و تخفیف‌ها را در ایمیل خود دریافت کنید.
                </p>
                <form className="mt-4 sm:flex space-x-5 sm:max-w-lg ">
                  <label htmlFor="email-address" className="sr-only">
                    آدرس ایمیل
                  </label>
                  <input
                    type="email"
                    name="email-address"
                    id="email-address"
                    autoComplete="email"
                    required
                    className="w-[300px] min-w-0 appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-black outline-none sm:text-sm"
                    placeholder="ایمیل خود را وارد کنید"
                  />
                  <div className="mt-3 sm:mt-0 sm:ml-4 sm:flex-shrink-0">
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center rounded-md bg-white text-primary px-3 py-2 text-sm font-semibold shadow-sm"
                    >
                      اشتراک
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* کپی رایت */}
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-black text-center">
            © {new Date().getFullYear()} YouRide. تمامی حقوق محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
