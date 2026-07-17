import { useEffect, useMemo, useRef, useState } from "react";
import { streamContractProcessingEvents } from "../../api/contractApi.js";
import { Icon } from "./Icon.jsx";
import { ProgressRing } from "./ProgressRing.jsx";
import { toCssVariable } from "../../utils/toCssVariable.js";
import styles from "./Analyzing.module.scss";

const DEFAULT_STATUS_STAGE_MAP = {
  PROCESSING: 0,
  OCR_EXTRACTING: 1,
  AI_EXTRACTING: 2,
  CHECKLIST_GENERATING: 3,
  COMPLETED: Number.POSITIVE_INFINITY,
};

const STATUS_LABELS = {
  PROCESSING: "분석 준비 중",
  OCR_EXTRACTING: "계약서 텍스트 추출 중",
  AI_EXTRACTING: "계약 정보 분석 중",
  CHECKLIST_GENERATING: "체크리스트 생성 중",
  COMPLETED: "분석 완료",
  FAILED: "분석 실패",
};

const isAbortError = (error) => error?.name === "AbortError";

/**
 * Contract analysis progress UI.
 *
 * Progress follows the backend SSE stream when contractId is available.
 * Without a stream, stages advance visually until the parent changes screens.
 */
export function Analyzing({
  stages,
  contractId,
  statusStageMap = DEFAULT_STATUS_STAGE_MAP,
  fallbackStepIntervalMs = 2200,
  onFinished,
  onFailed,
  title = "ZIPT가 분석하고 있어요",
  subtitle = "잠시만 기다려 주세요",
}) {
  const [step, setStep] = useState(0);
  const [processingStatus, setProcessingStatus] = useState(contractId ? "PROCESSING" : "");
  const [errorMessage, setErrorMessage] = useState("");
  const onFinishedRef = useRef(onFinished);
  const onFailedRef = useRef(onFailed);
  const hasEventStream = contractId != null;

  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    onFailedRef.current = onFailed;
  }, [onFailed]);

  const statusLabel = useMemo(() => {
    if (!processingStatus) return "";
    return STATUS_LABELS[processingStatus] ?? processingStatus;
  }, [processingStatus]);

  useEffect(() => {
    if (!hasEventStream) return;

    const controller = new AbortController();
    let finishTimerId;

    setStep(0);
    setProcessingStatus("PROCESSING");
    setErrorMessage("");

    streamContractProcessingEvents({
      contractId,
      signal: controller.signal,
      onEvent: ({ event, data }) => {
        if (event !== "processing-status" || !data) return;

        const nextStatus = String(data.status ?? "").toUpperCase();
        if (!nextStatus) return;

        setProcessingStatus(nextStatus);
        setErrorMessage(data.errorMessage ?? "");

        if (nextStatus === "FAILED") {
          onFailedRef.current?.(data.errorMessage || "분석 중 오류가 발생했습니다.");
          controller.abort();
          return;
        }

        if (nextStatus === "COMPLETED") {
          setStep(stages.length);
          finishTimerId = window.setTimeout(() => {
            controller.abort();
            onFinishedRef.current?.();
          }, 700);
          return;
        }

        const mappedStep = statusStageMap[nextStatus];
        if (Number.isFinite(mappedStep)) {
          setStep((currentStep) => Math.max(currentStep, Math.min(mappedStep, stages.length - 1)));
        }
      },
    }).catch((error) => {
      if (isAbortError(error) || controller.signal.aborted) return;
      setErrorMessage("진행 상태를 불러오지 못했습니다. 분석은 계속 진행 중입니다.");
    });

    return () => {
      if (finishTimerId) window.clearTimeout(finishTimerId);
      controller.abort();
    };
  }, [contractId, hasEventStream, stages.length, statusStageMap]);

  useEffect(() => {
    if (hasEventStream || stages.length <= 1) return;

    setStep(0);
    setProcessingStatus("");
    setErrorMessage("");

    const timerId = window.setInterval(() => {
      setStep((currentStep) => {
        if (currentStep >= stages.length - 1) {
          window.clearInterval(timerId);
          return currentStep;
        }
        return currentStep + 1;
      });
    }, fallbackStepIntervalMs);

    return () => {
      window.clearInterval(timerId);
    };
  }, [fallbackStepIntervalMs, hasEventStream, stages.length]);

  const progress = Math.min(100, (step / stages.length) * 100);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.ringWrap}>
          <ProgressRing value={progress} size={96} thickness={8}>
            <Icon className={styles.sparkleIcon} name="sparkle" size={30} color="var(--primary)" stroke={2} />
          </ProgressRing>
        </span>
        <div className={styles.title}>{title}</div>
        <div className={styles.subtitle}>{subtitle}</div>
        {statusLabel && (
          <div className={styles.statusText}>
            현재 상태: {statusLabel}
          </div>
        )}
        {errorMessage && (
          <div className={styles.errorText} role="status">
            {errorMessage}
          </div>
        )}
      </div>

      <div className={styles.stageList}>
        {stages.map((stage, i) => {
          const done = i < step;
          const active = i === step;

          return (
            <div
              key={stage.title}
              className={styles.stageRow}
              style={{
                "--stage-row-background": toCssVariable(active ? "var(--primary-soft)" : "var(--surface)"),
                "--stage-row-border": toCssVariable(`1px solid ${active ? "var(--primary-soft-2)" : "var(--line)"}`),
                "--stage-row-opacity": i > step ? 0.5 : 1,
              }}
            >
              <span
                className={styles.stageIcon}
                style={{ "--stage-icon-background": toCssVariable(done ? "var(--safe-soft)" : active ? "var(--primary)" : "var(--surface-3)") }}
              >
                {done ? (
                  <Icon name="check" size={18} color="var(--safe)" stroke={3} />
                ) : (
                  <Icon
                    name={stage.icon}
                    size={18}
                    color={active ? "#fff" : "var(--ink-4)"}
                    stroke={2}
                    style={active ? { animation: "zipt-pulse 1s infinite" } : undefined}
                  />
                )}
              </span>
              <div className={styles.stageText}>
                <div className={styles.stageTitle} style={{ "--stage-title-color": toCssVariable(active ? "var(--primary-700)" : "var(--ink)") }}>
                  {stage.title}
                </div>
                <div className={styles.stageSub}>{stage.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
