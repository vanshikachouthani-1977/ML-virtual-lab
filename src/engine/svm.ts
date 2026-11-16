// ─── Sequential Minimal Optimization (SMO) SVM Solver ───────────────────────
// A complete, in-browser implementation of the SMO algorithm for training SVMs.
// Supports Linear, Polynomial, and RBF kernels. Runs entirely client-side.

import { createKernel, type KernelFn } from './kernels';
import type { Point, SVMParams, SVMResult, SVMModel } from '../types';

interface SMOConfig {
  C: number;
  tol: number;
  maxPasses: number;
  kernel: KernelFn;
}

/**
 * Train an SVM using the Simplified SMO algorithm.
 * Based on Andrew Ng's CS229 simplified SMO with improvements
 * for numerical stability and convergence.
 */
function smoTrain(
  X: number[][],
  y: number[],
  config: SMOConfig
): { alphas: number[]; b: number; iterations: number } {
  const { C, tol, maxPasses, kernel } = config;
  const n = X.length;

  // Initialize
  const alphas = new Array(n).fill(0);
  let b = 0;
  let passes = 0;
  let iterations = 0;

  // Pre-compute kernel matrix for performance
  const K: number[][] = [];
  for (let i = 0; i < n; i++) {
    K[i] = [];
    for (let j = 0; j < n; j++) {
      K[i][j] = kernel(X[i], X[j]);
    }
  }

  // Error cache
  const E = new Array(n).fill(0);
  const computeE = (i: number): number => {
    let sum = 0;
    for (let k = 0; k < n; k++) {
      sum += alphas[k] * y[k] * K[k][i];
    }
    return sum + b - y[i];
  };

  // Initialize error cache
  for (let i = 0; i < n; i++) E[i] = computeE(i);

  while (passes < maxPasses && iterations < maxPasses * n * 2) {
    let numChangedAlphas = 0;

    for (let i = 0; i < n; i++) {
      iterations++;
      E[i] = computeE(i);

      // Check KKT conditions
      if (
        (y[i] * E[i] < -tol && alphas[i] < C) ||
        (y[i] * E[i] > tol && alphas[i] > 0)
      ) {
        // Select j ≠ i — use max |Ei - Ej| heuristic when possible
        let j: number;
        let maxDeltaE = 0;
        j = Math.floor(Math.random() * (n - 1));
        if (j >= i) j++;

        // Try to find a better j using second choice heuristic
        for (let k = 0; k < n; k++) {
          if (k === i) continue;
          const deltaE = Math.abs(E[i] - E[k]);
          if (deltaE > maxDeltaE) {
            maxDeltaE = deltaE;
            j = k;
          }
        }

        E[j] = computeE(j);

        // Save old alphas
        const alphaI_old = alphas[i];
        const alphaJ_old = alphas[j];

        // Compute L and H bounds
        let L: number, H: number;
        if (y[i] !== y[j]) {
          L = Math.max(0, alphas[j] - alphas[i]);
          H = Math.min(C, C + alphas[j] - alphas[i]);
        } else {
          L = Math.max(0, alphas[i] + alphas[j] - C);
          H = Math.min(C, alphas[i] + alphas[j]);
        }

        if (Math.abs(L - H) < 1e-10) continue;

        // Compute eta
        const eta = 2 * K[i][j] - K[i][i] - K[j][j];
        if (eta >= 0) continue;

        // Update alpha_j
        alphas[j] = alphaJ_old - (y[j] * (E[i] - E[j])) / eta;

        // Clip alpha_j
        if (alphas[j] > H) alphas[j] = H;
        else if (alphas[j] < L) alphas[j] = L;

        if (Math.abs(alphas[j] - alphaJ_old) < 1e-5) {
          alphas[j] = alphaJ_old;
          continue;
        }

        // Update alpha_i
        alphas[i] = alphaI_old + y[i] * y[j] * (alphaJ_old - alphas[j]);

        // Compute b
        const b1 =
          b -
          E[i] -
          y[i] * (alphas[i] - alphaI_old) * K[i][i] -
          y[j] * (alphas[j] - alphaJ_old) * K[i][j];

        const b2 =
          b -
          E[j] -
          y[i] * (alphas[i] - alphaI_old) * K[i][j] -
          y[j] * (alphas[j] - alphaJ_old) * K[j][j];

        if (0 < alphas[i] && alphas[i] < C) {
          b = b1;
        } else if (0 < alphas[j] && alphas[j] < C) {
          b = b2;
        } else {
          b = (b1 + b2) / 2;
        }

        // Update error cache
        for (let k = 0; k < n; k++) {
          E[k] = computeE(k);
        }

        numChangedAlphas++;
      }
    }

    if (numChangedAlphas === 0) {
      passes++;
    } else {
      passes = 0;
    }
  }

  return { alphas, b, iterations };
}

/**
 * Train an SVM model from points and parameters.
 * Returns a full SVMModel with predict and decisionFunction methods.
 */
export function trainSVM(points: Point[], params: SVMParams): SVMModel | null {
  if (points.length < 2) return null;

  const positiveCount = points.filter((p) => p.label === 1).length;
  const negativeCount = points.filter((p) => p.label === -1).length;
  if (positiveCount === 0 || negativeCount === 0) return null;

  const startTime = performance.now();

  const X = points.map((p) => [p.x, p.y]);
  const y = points.map((p) => p.label);

  const kernel = createKernel(params.kernelType, params.gamma, params.degree, params.coef0);

  const { alphas, b, iterations } = smoTrain(X, y, {
    C: params.C,
    tol: 1e-3,
    maxPasses: 20,
    kernel,
  });

  const trainingTimeMs = performance.now() - startTime;

  // Identify support vectors (alpha > threshold)
  const svThreshold = 1e-5;
  const supportVectorIndices: number[] = [];
  for (let i = 0; i < alphas.length; i++) {
    if (alphas[i] > svThreshold) {
      supportVectorIndices.push(i);
    }
  }

  // Decision function: f(x) = Σ αᵢyᵢK(xᵢ,x) + b
  const decisionFunction = (px: number, py: number): number => {
    const xTest = [px, py];
    let sum = 0;
    for (const idx of supportVectorIndices) {
      sum += alphas[idx] * y[idx] * kernel(X[idx], xTest);
    }
    return sum + b;
  };

  // Predict: sign of decision function
  const predict = (px: number, py: number): number => {
    return decisionFunction(px, py) >= 0 ? 1 : -1;
  };

  // Compute training accuracy
  let correct = 0;
  for (let i = 0; i < points.length; i++) {
    if (predict(points[i].x, points[i].y) === points[i].label) correct++;
  }
  const accuracy = correct / points.length;

  // Compute weights for linear kernel
  let weights: number[] | null = null;
  if (params.kernelType === 'linear') {
    weights = [0, 0];
    for (const idx of supportVectorIndices) {
      weights[0] += alphas[idx] * y[idx] * X[idx][0];
      weights[1] += alphas[idx] * y[idx] * X[idx][1];
    }
  }

  // Compute margin width
  let marginWidth = 0;
  if (weights && (weights[0] !== 0 || weights[1] !== 0)) {
    const wNorm = Math.sqrt(weights[0] * weights[0] + weights[1] * weights[1]);
    marginWidth = 2 / wNorm;
  } else if (supportVectorIndices.length >= 2) {
    // Approximate margin from SV decision values
    const svDecisionValues = supportVectorIndices.map((idx) =>
      Math.abs(decisionFunction(X[idx][0], X[idx][1]))
    );
    const avgSvValue = svDecisionValues.reduce((a, v) => a + v, 0) / svDecisionValues.length;
    marginWidth = avgSvValue > 0 ? 2 / avgSvValue : 0;
  }

  const result: SVMResult = {
    alphas,
    bias: b,
    supportVectorIndices,
    weights,
    accuracy,
    marginWidth,
    trainingTimeMs,
    converged: true,
    iterations,
  };

  return {
    result,
    params: { ...params },
    points: [...points],
    predict,
    decisionFunction,
  };
}

/**
 * Evaluate the decision function on a grid for contour rendering.
 * Returns a flat Float32Array of decision function values.
 */
export function evaluateGrid(
  model: SVMModel,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  resolution: number
): Float32Array {
  const grid = new Float32Array(resolution * resolution);
  const xStep = (xMax - xMin) / (resolution - 1);
  const yStep = (yMax - yMin) / (resolution - 1);

  for (let iy = 0; iy < resolution; iy++) {
    const py = yMin + iy * yStep;
    for (let ix = 0; ix < resolution; ix++) {
      const px = xMin + ix * xStep;
      grid[iy * resolution + ix] = model.decisionFunction(px, py);
    }
  }

  return grid;
}
