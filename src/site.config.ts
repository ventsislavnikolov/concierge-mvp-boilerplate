/**
 * The single file you edit to restructure this template for a new idea.
 * Sections render in array order; add, remove, or repeat slots freely.
 * Copy lives in messages/{bg,en,el}.json — fields here hold message
 * functions (m.*), so every string is translated in one place.
 */

import { m } from "@/paraglide/messages";

type Msg = () => string;

export interface HeroSection {
  cta: { label: Msg; href: string };
  headline: Msg;
  subline: Msg;
  type: "hero";
}

export interface PainSection {
  points: Msg[];
  title: Msg;
  type: "pain";
}

export interface SolutionSection {
  features: { title: Msg; description: Msg }[];
  title: Msg;
  type: "solution";
}

export interface CtaSection {
  button: { label: Msg; href: string };
  disclaimer?: Msg;
  subtitle: Msg;
  title: Msg;
  type: "cta";
}

export type Section = HeroSection | PainSection | SolutionSection | CtaSection;

export interface QuizQuestion {
  id: string;
  options: { id: string; label: Msg }[];
  /** Probe current behavior (Mom Test) — never future intent. */
  question: Msg;
}

export interface QuizConfig {
  questions: QuizQuestion[];
  thanks: Msg;
  title: Msg;
}

export interface SiteConfig {
  brand: {
    name: Msg;
    tagline: Msg;
  };
  meta: {
    title: Msg;
    description: Msg;
  };
  quiz: QuizConfig;
  sections: Section[];
}

export const siteConfig: SiteConfig = {
  brand: {
    name: m.brand_name,
    tagline: m.brand_tagline,
  },
  meta: {
    description: m.meta_description,
    title: m.meta_title,
  },
  quiz: {
    questions: [
      {
        id: "organize-today",
        options: [
          { id: "chat", label: m.quiz_q_organize_chat },
          { id: "sheet", label: m.quiz_q_organize_sheet },
          { id: "calls", label: m.quiz_q_organize_calls },
          { id: "other", label: m.quiz_q_organize_other },
        ],
        question: m.quiz_q_organize,
      },
      {
        id: "frequency",
        options: [
          { id: "weekly", label: m.quiz_q_frequency_weekly },
          { id: "monthly", label: m.quiz_q_frequency_monthly },
          { id: "rarely", label: m.quiz_q_frequency_rarely },
        ],
        question: m.quiz_q_frequency,
      },
      {
        id: "last-pain",
        options: [
          { id: "denied", label: m.quiz_q_pain_denied },
          { id: "incomplete", label: m.quiz_q_pain_incomplete },
          { id: "payment", label: m.quiz_q_pain_payment },
          { id: "none", label: m.quiz_q_pain_none },
        ],
        question: m.quiz_q_pain,
      },
    ],
    thanks: m.quiz_thanks,
    title: m.quiz_title,
  },
  sections: [
    {
      cta: { href: "#waitlist", label: m.hero_cta },
      headline: m.hero_headline,
      subline: m.hero_subline,
      type: "hero",
    },
    {
      points: [
        m.pain_point_copying,
        m.pain_point_dropout,
        m.pain_point_payments,
        m.pain_point_reserves,
      ],
      title: m.pain_title,
      type: "pain",
    },
    {
      features: [
        {
          description: m.solution_oneclick_desc,
          title: m.solution_oneclick_title,
        },
        {
          description: m.solution_livelist_desc,
          title: m.solution_livelist_title,
        },
        { description: m.solution_bot_desc, title: m.solution_bot_title },
      ],
      title: m.solution_title,
      type: "solution",
    },
    {
      button: { href: "#waitlist", label: m.cta_button },
      disclaimer: m.cta_disclaimer,
      subtitle: m.cta_subtitle,
      title: m.cta_title,
      type: "cta",
    },
  ],
};
