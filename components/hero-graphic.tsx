"use client";

export function HeroGraphic() {
  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square md:aspect-[4/3] flex items-center justify-center lg:ml-10">
      <div className="relative z-10 w-full flex items-center justify-center px-4">
        <img 
          src="/hero.svg" 
          alt="Student studying with BSPrep" 
          className="w-full h-auto object-contain scale-110 md:scale-125" 
        />
      </div>
    </div>
  );
}
