import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { capture } from "@/lib/posthog";
import { siteConfig } from "@/site.config";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

function OptionButton({
  onPick,
  option,
}: {
  onPick: (option: string) => void;
  option: string;
}) {
  const handleClick = useCallback(() => onPick(option), [onPick, option]);
  return (
    <Button
      className="h-auto min-h-11 justify-start whitespace-normal text-left"
      onClick={handleClick}
      variant="outline"
    >
      {option}
    </Button>
  );
}

/**
 * Post-signup micro-survey: one question at a time, answers land in
 * Convex linked to the lead. Questions live in site.config.ts and must
 * probe current behavior (Mom Test), never future intent.
 */
export function Quiz({ leadId }: { leadId: Id<"leads"> }) {
  const { questions, thanks, title } = siteConfig.quiz;
  const [step, setStep] = useState(0);
  const submit = useMutation({
    mutationFn: useConvexMutation(api.quiz.answer),
  });

  const question = questions.at(step);

  const handlePick = useCallback(
    (option: string) => {
      if (!question) {
        return;
      }
      submit.mutate({
        answer: option,
        leadId,
        questionId: question.id,
      });
      capture("quiz_answered", { questionId: question.id });
      const next = step + 1;
      if (next >= questions.length) {
        capture("quiz_completed", { questions: questions.length });
      }
      setStep(next);
    },
    [leadId, question, questions.length, step, submit]
  );

  if (questions.length === 0) {
    return null;
  }

  if (!question) {
    return (
      <p className="rounded-lg border bg-card px-4 py-3 text-card-foreground">
        {thanks}
      </p>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-3 text-left">
      <p className="text-muted-foreground text-sm">
        {title} · {step + 1}/{questions.length}
      </p>
      <h3 className="font-medium text-lg">{question.question}</h3>
      <div className="flex flex-col gap-2">
        {question.options.map((option) => (
          <OptionButton key={option} onPick={handlePick} option={option} />
        ))}
      </div>
    </div>
  );
}
