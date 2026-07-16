/**
 * The single file you edit to rebrand this template for a new idea.
 * Sections render in array order; add, remove, or repeat slots freely.
 * Copy lives here until i18n (Paraglide) replaces raw strings with messages.
 */

export interface HeroSection {
  cta: { label: string; href: string };
  headline: string;
  subline: string;
  type: "hero";
}

export interface PainSection {
  points: string[];
  title: string;
  type: "pain";
}

export interface SolutionSection {
  features: { title: string; description: string }[];
  title: string;
  type: "solution";
}

export interface CtaSection {
  button: { label: string; href: string };
  disclaimer?: string;
  subtitle: string;
  title: string;
  type: "cta";
}

export type Section = HeroSection | PainSection | SolutionSection | CtaSection;

export interface SiteConfig {
  brand: {
    name: string;
    tagline: string;
  };
  meta: {
    title: string;
    description: string;
    lang: string;
  };
  sections: Section[];
}

export const siteConfig: SiteConfig = {
  brand: {
    name: "Мачът е в неделя",
    tagline: "Организирай мача с един линк",
  },
  meta: {
    description:
      "Записване с един клик, жив списък с резерви и бот в групата. Спри да преписваш списъци на ръка.",
    lang: "bg",
    title: "Мачът е в неделя — организирай мача с един линк",
  },
  sections: [
    {
      cta: { href: "#waitlist", label: "Запиши се за ранен достъп" },
      headline: "Организирай мача с един линк",
      subline:
        "Записване с един клик, жив списък с титуляри и резерви, напомняния преди мача — направо в групата ви.",
      type: "hero",
    },
    {
      points: [
        "Списъкът се преписва на ръка след всяко ново съобщение в групата.",
        "В четвъртък си на 12 души, в неделя сутрин сте 7.",
        "Кой е платил и кой не — никой не помни.",
        "Резервите разбират, че играят, 30 минути преди мача.",
      ],
      title: "Познато ли ти е?",
      type: "pain",
    },
    {
      features: [
        {
          description:
            "Хвърляш линк в групата — всеки се записва сам. Без регистрация за играчите.",
          title: "Запис с един клик",
        },
        {
          description:
            "Титуляри и резерви се виждат от всички, обновяват се на момента.",
          title: "Жив списък",
        },
        {
          description:
            "Ботът публикува обновения списък в Telegram групата при всяка промяна.",
          title: "Бот в групата",
        },
      ],
      title: "Как ще работи",
      type: "solution",
    },
    {
      button: { href: "#waitlist", label: "Запиши се" },
      disclaimer: "Без спам. Само едно писмо, когато сме готови.",
      subtitle:
        "Остави имейл и ще ти пишем, когато отворим ранния достъп. Първите отбори играят безплатно.",
      title: "Искаш ли го за твоя отбор?",
      type: "cta",
    },
  ],
};
