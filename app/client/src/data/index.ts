import { ALERT, LIKE, ROBOT } from "../utils/constants";

export const instructions = (t: any, locale: any) => [
  {
    icon: ALERT,
    instruction: t(locale, "Instruction1"),
  },
  {
    icon: ROBOT,
    instruction: t(locale, "Instruction2"),
  },
  {
    icon: LIKE,
    instruction: t(locale, "Instruction3"),
  },
];

export const frequentQuestions = (t: any, locale: any) => [
  {
    question: t(locale, "Question1"),
  },
  {
    question: t(locale, "Question2"),
  },
  {
    question: t(locale, "Question3"),
  },
];
