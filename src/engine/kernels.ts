// ─── Kernel Functions for SVM ────────────────────────────────────────────────
// Pure mathematical kernel implementations used by the SMO solver.

export type KernelFn = (x1: number[], x2: number[]) => number;

/** Dot product of two vectors */
function dot(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

/** Squared Euclidean distance */
function sqDist(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return sum;
}

/** Linear kernel: K(x, z) = x · z */
export function linearKernel(x1: number[], x2: number[]): number {
  return dot(x1, x2);
}

/** Polynomial kernel: K(x, z) = (γ · x·z + r)^d */
export function polynomialKernel(gamma: number, degree: number, coef0: number): KernelFn {
  return (x1, x2) => Math.pow(gamma * dot(x1, x2) + coef0, degree);
}

/** Radial Basis Function (Gaussian) kernel: K(x, z) = exp(-γ ||x-z||²) */
export function rbfKernel(gamma: number): KernelFn {
  return (x1, x2) => Math.exp(-gamma * sqDist(x1, x2));
}

/** Create a kernel function from parameters */
export function createKernel(
  type: 'linear' | 'polynomial' | 'rbf',
  gamma: number = 1,
  degree: number = 3,
  coef0: number = 0
): KernelFn {
  switch (type) {
    case 'linear':
      return linearKernel;
    case 'polynomial':
      return polynomialKernel(gamma, degree, coef0);
    case 'rbf':
      return rbfKernel(gamma);
  }
}
