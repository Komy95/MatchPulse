"use client";

import { useMemo, useState } from "react";
import type { MatchPredictionSummary } from "@/lib/predictions/types";
import {
  Badge,
  Button,
  Card,
  FixtureCard,
  ScoreInput as UiScoreInput,
} from "@/components/ui/primitives";

type PredictionDraft = {
  homeGoals: string;
  awayGoals: string;
  booster: boolean;
};

export function PredictionEntry({
  groupId,
  groupSeasonId,
  matches,
  allowBooster,
}: {
  groupId: string;
  groupSeasonId: string;
  matches: MatchPredictionSummary[];
  allowBooster: boolean;
}) {
  const [drafts, setDrafts] = useState<Record<string, PredictionDraft>>(() =>
    Object.fromEntries(
      matches.map((match) => [
        match.id,
        {
          homeGoals: match.prediction?.homeGoals.toString() ?? "",
          awayGoals: match.prediction?.awayGoals.toString() ?? "",
          booster: match.prediction?.booster ?? false,
        },
      ]),
    ),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const saveableCount = useMemo(
    () =>
      matches.filter((match) => {
        const draft = drafts[match.id];
        return !match.locked && draft?.homeGoals !== "" && draft?.awayGoals !== "";
      }).length,
    [drafts, matches],
  );

  async function savePredictions() {
    setSaving(true);
    setMessage(null);

    try {
      const predictions = matches
        .filter((match) => !match.locked)
        .map((match) => {
          const draft = drafts[match.id];

          return draft?.homeGoals !== "" && draft?.awayGoals !== ""
            ? {
                matchId: match.id,
                homeGoals: Number(draft.homeGoals),
                awayGoals: Number(draft.awayGoals),
                booster: Boolean(draft.booster),
              }
            : null;
        })
        .filter((prediction): prediction is NonNullable<typeof prediction> => prediction !== null);

      if (predictions.length === 0) {
        setMessage("Add at least one unlocked prediction before saving.");
        return;
      }

      const response = await fetch(
        `/api/v1/groups/${groupId}/seasons/${groupSeasonId}/predictions`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ predictions }),
        },
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Predictions could not be saved.");
      }

      setMessage(
        `${payload.saved} saved, ${payload.unchanged} unchanged, ${payload.revisionsCreated} revised.`,
      );
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Predictions could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  function updateDraft(matchId: string, patch: Partial<PredictionDraft>) {
    setDrafts((current) => ({
      ...current,
      [matchId]: {
        ...current[matchId],
        ...patch,
      },
    }));
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-pitchGreen">Predictions</p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight">Match picks</h2>
        </div>
        <Badge tone="blue">
          {saveableCount} ready
        </Badge>
      </div>

      {matches.length === 0 ? (
        <div className="mt-5 rounded-md border border-borderSoft bg-cardWarm p-5">
          <h3 className="text-lg font-semibold">No matches seeded yet</h3>
          <p className="mt-2 text-sm leading-6 text-secondaryText">
            Seed local World Cup reference data to start entering predictions.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {matches.map((match) => {
            const draft = drafts[match.id];

            return (
              <FixtureCard key={match.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-mutedText">
                      {formatKickoff(match.kickoffAt)}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold leading-snug">
                      {match.homeTeam.shortName} vs {match.awayTeam.shortName}
                    </h3>
                    <p className="mt-1 text-sm text-secondaryText">
                      {match.stage}
                      {match.groupCode ? ` - Group ${match.groupCode}` : ""}
                    </p>
                  </div>
                  <Badge tone={match.locked ? "red" : "green"}>
                    {match.locked ? "Locked" : "Open"}
                  </Badge>
                </div>

                <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-3">
                  <ScoreInput
                    disabled={match.locked || saving}
                    label={match.homeTeam.name}
                    value={draft?.homeGoals ?? ""}
                    onChange={(value) => updateDraft(match.id, { homeGoals: value })}
                  />
                  <span className="pb-5 text-sm font-semibold text-secondaryText">vs</span>
                  <ScoreInput
                    disabled={match.locked || saving}
                    label={match.awayTeam.name}
                    value={draft?.awayGoals ?? ""}
                    onChange={(value) => updateDraft(match.id, { awayGoals: value })}
                  />
                </div>

                {allowBooster ? (
                  <label className="mt-4 flex min-h-12 items-center gap-3 rounded-md border border-line bg-cardWarm px-4 py-3 text-sm font-medium">
                    <input
                      checked={draft?.booster ?? false}
                      className="h-5 w-5 rounded border-borderSoft text-worldCupBlue focus:ring-worldCupBlue"
                      disabled={match.locked || saving}
                      type="checkbox"
                      onChange={(event) =>
                        updateDraft(match.id, { booster: event.target.checked })
                      }
                    />
                    Booster
                  </label>
                ) : null}
              </FixtureCard>
            );
          })}
        </div>
      )}

      <Button
        className="mt-5 w-full"
        disabled={saving || matches.length === 0}
        type="button"
        onClick={savePredictions}
      >
        {saving ? "Saving..." : "Save predictions"}
      </Button>

      {message ? (
        <div className="mt-4 rounded-md border border-worldCupBlue/15 bg-softSky px-4 py-3 text-sm leading-6">
          {message}
        </div>
      ) : null}
    </Card>
  );
}

function ScoreInput({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <UiScoreInput
      disabled={disabled}
      label={label}
      max={20}
      min={0}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function formatKickoff(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

