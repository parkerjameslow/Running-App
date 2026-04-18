"use client";

import { useRef, useState } from "react";
import { parseCsv, SAMPLE_CSV } from "@/lib/csv";
import type { RaceResult } from "@/lib/types";

interface Props {
  resultCount: number;
  onLoad: (results: RaceResult[], mode: "replace" | "append") => void;
  onClear: () => void;
}

export function DataControls({ resultCount, onLoad, onClear }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  async function handleFile(file: File) {
    const text = await file.text();
    const { results, errors: errs } = parseCsv(text);
    setErrors(errs.map((e) => `Row ${e.row}: ${e.message}`));
    if (results.length > 0) {
      onLoad(results, "append");
      setMessage(`Loaded ${results.length} result${results.length === 1 ? "" : "s"}.`);
    } else {
      setMessage("No valid rows found.");
    }
  }

  function loadSample() {
    const { results } = parseCsv(SAMPLE_CSV);
    onLoad(results, "replace");
    setMessage(`Loaded ${results.length} sample results.`);
    setErrors([]);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 items-center">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="px-3 py-1.5 rounded-md bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium"
        >
          Upload CSV
        </button>
        <button
          type="button"
          onClick={loadSample}
          className="px-3 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-sm"
        >
          Load sample data
        </button>
        {resultCount > 0 && (
          <button
            type="button"
            onClick={() => {
              if (confirm("Clear all results from your device?")) {
                onClear();
                setMessage("Cleared.");
                setErrors([]);
              }
            }}
            className="px-3 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-sm text-neutral-300"
          >
            Clear all
          </button>
        )}
        <span className="text-xs text-neutral-500 ml-auto">
          {resultCount} result{resultCount === 1 ? "" : "s"} stored
        </span>
      </div>

      {message && <div className="text-xs text-neutral-400">{message}</div>}
      {errors.length > 0 && (
        <details className="text-xs text-amber-400">
          <summary className="cursor-pointer">
            {errors.length} row{errors.length === 1 ? "" : "s"} skipped
          </summary>
          <ul className="mt-1 list-disc list-inside text-neutral-400">
            {errors.slice(0, 20).map((e, i) => (
              <li key={i}>{e}</li>
            ))}
            {errors.length > 20 && <li>…and {errors.length - 20} more</li>}
          </ul>
        </details>
      )}

      <details className="text-xs text-neutral-500">
        <summary className="cursor-pointer">CSV format</summary>
        <pre className="mt-2 p-2 bg-neutral-900 border border-neutral-800 rounded overflow-x-auto text-neutral-300">
{`Athlete Name,School,Gender,Classification,Event,Time,Meet,Date
Ethan Parker,Lone Peak HS,M,6A,1600m,4:14.23,Region Meet,2025-05-02`}
        </pre>
        <div className="mt-1">
          Gender: M / F. Classification: 1A–6A. Event: 100m, 200m, 400m, 800m, 1600m, 3200m, XC 5K,
          XC 3 Mile. Time: MM:SS.ms or SS.ms.
        </div>
      </details>
    </div>
  );
}
