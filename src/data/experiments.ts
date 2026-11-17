import type { ExperimentConfig } from '../types';
import {
  generateLinear,
  generateOverlapping,
  generateCircles,
  generateXOR,
  generateMoons,
  generateSpiral,
  generateDiagonal,
  generateClustered,
} from '../engine/datasets';

export const EXPERIMENTS: ExperimentConfig[] = [
  // ─── SINGLE COMPREHENSIVE EXPERIMENT: Support Vector Machine (SVM) ───────────
  {
    id: 'svm',
    number: 1,
    title: 'Support Vector Machine (SVM)',
    shortTitle: 'Support Vector Machine (SVM)',
    description:
      'To study the theory, mathematical formulation, and working principle of Support Vector Machines (SVM), and to analyze the impact of maximum margin optimization, soft-margin regularization (C), and non-linear kernel transformations (Linear, Polynomial, RBF) with interactive 2D and 3D feature space visualization.',
    iconName: 'Maximize2',
    color: '#6366f1',
    defaultParams: {
      C: 1.0,
      kernelType: 'linear',
      gamma: 1.0,
      degree: 3,
      coef0: 0,
      epsilon: 0.1,
    },
    datasetPresets: [
      { name: 'Linearly Separable', iconName: 'Compass', generate: generateLinear },
      { name: 'Overlapping Noise', iconName: 'Layers', generate: generateOverlapping },
      { name: 'Concentric Rings', iconName: 'Target', generate: generateCircles },
      { name: 'XOR Distribution', iconName: 'Grid', generate: generateXOR },
      { name: 'Interlocking Moons', iconName: 'Moon', generate: generateMoons },
      { name: 'Spiral Manifold', iconName: 'RotateCw', generate: generateSpiral },
      { name: 'Multi-Cluster Split', iconName: 'Boxes', generate: generateClustered },
      { name: 'Diagonal Boundary', iconName: 'TrendingUp', generate: generateDiagonal },
    ],
    features: ['margin', 'contour', 'kernel-switch', 'c-slider', 'gamma-slider', 'degree-slider', '3d-view'],
    simulationInstructions: {
      objective:
        'Interactively train and analyze a Support Vector Machine on custom and benchmark 2D distributions. Observe the maximum margin boundary, identify support vectors, tune the regularization parameter C, and apply the Kernel Trick to achieve linear separability in 3D feature space.',
      userActions: [
        'Left-Click anywhere on the coordinate plane to drop a Class +1 sample (Indigo point).',
        'Shift + Left-Click or Right-Click anywhere on the coordinate plane to drop a Class -1 sample (Rose point).',
        'Right-Click an existing sample point to delete it from the dataset.',
        'Use the "Dataset Presets" panel to quickly switch between standard distributions (Linearly Separable, Concentric Rings, XOR, Moons).',
        'Use the "Kernel Function" toggle to switch between Linear, Polynomial, and RBF (Gaussian) kernels.',
        'Adjust the "C (Regularization Penalty)" slider to control the trade-off between margin width and classification errors.',
        'Adjust the "γ (Gamma)" slider for RBF kernels to control the locality and curvature of the boundary.',
        'Click the "3D Kernel Feature Space" mode switch to rotate and examine non-linear data projected onto an elevated paraboloid surface sliced by a 2D plane.',
      ],
      visualElements: [
        {
          name: 'Decision Boundary',
          visual: 'Solid Emerald Line',
          meaning: 'The optimal separating hyperplane where wᵀx + b = 0. New points falling on either side are assigned corresponding predicted labels.',
        },
        {
          name: 'Margin Planes',
          visual: 'Dashed Emerald Lines (±1)',
          meaning: 'The canonical boundary gutters at wᵀx + b = +1 and wᵀx + b = -1. The perpendicular distance between these gutters is the Total Margin (2/||w||).',
        },
        {
          name: 'Support Vectors',
          visual: 'Glowing Amber Rings',
          meaning: 'The critical subset of training points lying on the margin planes or violating them (αᵢ > 0). Moving any other non-SV point does NOT change the boundary.',
        },
        {
          name: 'Confidence Contour Heatmap',
          visual: 'Blue / Red Background Shading',
          meaning: 'Shows the continuous signed distance f(x) = wᵀx + b over the entire plane. Darker shade indicates higher classification confidence.',
        },
        {
          name: '3D Feature Space View',
          visual: 'Interactive Rotatable 3D Canvas',
          meaning: 'Visualizes the Kernel Trick: 2D non-linear points are elevated onto a 3D paraboloid z = x₁² + x₂² where a flat horizontal plane easily separates them.',
        },
        {
          name: 'Telemetry Metrics Panel',
          visual: 'Right-Side Real-Time Cards',
          meaning: 'Displays the exact computed Hyperplane Equation, Classification Accuracy, Total Margin Width, Active Support Vector count, and QP solver convergence time.',
        },
      ],
      guidedTasks: [
        {
          id: 1,
          title: 'Maximum Margin & Dual Sparsity Verification',
          action: 'Load the "Linearly Separable" preset with Linear Kernel. Note the number of glowing amber support vectors.',
          observation: 'Notice that out of 50 samples, only 3 or 4 points are glowing amber. Add several new points deep inside either cluster; observe that the green boundary does NOT move at all.',
        },
        {
          id: 2,
          title: 'Regularization Parameter C & Noise Tolerance',
          action: 'Load "Overlapping Noise". Vary C from 0.01 (soft margin) up to 1000 (hard margin).',
          observation: 'At low C (0.01), the margin expands widely and tolerates overlapping noise gracefully. At high C (1000), the margin shrinks tightly as the model attempts to classify every single outlier.',
        },
        {
          id: 3,
          title: 'The Kernel Trick on Non-Linear Concentric Rings',
          action: 'Load "Concentric Rings" with Linear Kernel (accuracy ~50%). Then switch Kernel to "RBF (Gaussian)".',
          observation: 'The Linear boundary fails completely on concentric circles. Switching to RBF produces a smooth, closed circular boundary achieving 100% classification accuracy.',
        },
        {
          id: 4,
          title: 'Inspect 3D Feature Space Elevation',
          action: 'With "Concentric Rings" loaded, click the "3D Kernel Feature Space" mode toggle. Click and drag to rotate the camera.',
          observation: 'In 3D, the inner ring points sit low at the base of the paraboloid bowl, while outer ring points sit high up on the rim. A flat horizontal plane cuts between them with zero non-linear curvature in 3D.',
        },
        {
          id: 5,
          title: 'Gamma Hyperparameter & Overfitting Control',
          action: 'Switch back to 2D view on "Interlocking Moons" with RBF kernel. Increase γ from 1.0 to 50 or 100.',
          observation: 'At very high γ, the decision boundary fractures into tight, isolated circular islands around individual points, illustrating severe overfitting.',
        },
      ],
    },
    theory: [
      {
        title: '1. Geometric Margin & The Optimal Separating Hyperplane',
        content: `### Problem Formulation
Given a binary classification training dataset $\\mathcal{D} = \\{(\\mathbf{x}_i, y_i)\\}_{i=1}^N$ where $\\mathbf{x}_i \\in \\mathbb{R}^d$ and labels $y_i \\in \\{-1, +1\\}$:

A linear decision boundary is parameterized by a weight vector $\\mathbf{w} \\in \\mathbb{R}^d$ and bias $b \\in \\mathbb{R}$:
$$
\\mathbf{w}^T \\mathbf{x} + b = 0
$$

For linearly separable data, the hyperplane must satisfy:
- For positive samples: $\\mathbf{w}^T \\mathbf{x}_i + b \\ge +1$
- For negative samples: $\\mathbf{w}^T \\mathbf{x}_i + b \\le -1$

These two conditions are unified into the canonical **separating constraint**:
$$
y_i (\\mathbf{w}^T \\mathbf{x}_i + b) \\ge 1, \\quad \\forall i = 1, \\dots, N
$$

### Derivation of the Geometric Margin
The perpendicular distance from any point $\\mathbf{x}$ to the hyperplane is:
$$
\\gamma = \\frac{|\\mathbf{w}^T \\mathbf{x} + b|}{\\|\\mathbf{w}\\|}
$$

For the canonical support vectors lying on the positive margin plane ($\\mathbf{w}^T \\mathbf{x}_+ + b = 1$) and negative margin plane ($\\mathbf{w}^T \\mathbf{x}_- + b = -1$), subtracting gives:
$$
\\mathbf{w}^T (\\mathbf{x}_+ - \\mathbf{x}_-) = 2 \\implies \\frac{\\mathbf{w}^T}{\\|\\mathbf{w}\\|} (\\mathbf{x}_+ - \\mathbf{x}_-) = \\frac{2}{\\|\\mathbf{w}\\|}
$$

Thus, the total geometric margin between the two classes is:
$$
\\text{Total Margin} = \\frac{2}{\\|\\mathbf{w}\\|}
$$

Maximizing this margin is equivalent to **minimizing** $\\frac{1}{2} \\|\\mathbf{w}\\|^2$.`,
      },
      {
        title: '2. Primal Convex Optimization & Wolfe Dual Formulation',
        content: `### The Primal Quadratic Optimization Problem
$$
\\min_{\\mathbf{w}, b} \\frac{1}{2} \\|\\mathbf{w}\\|^2
$$
subject to:
$$
y_i (\\mathbf{w}^T \\mathbf{x}_i + b) \\ge 1, \\quad \\forall i = 1, \\dots, N
$$

Because the objective is strictly convex quadratic and constraints are linear inequalities, this is a **Convex Quadratic Programming (QP)** problem with a unique global optimum.

### Lagrangian Formulation
Introducing Lagrange multipliers $\\alpha_i \\ge 0$:
$$
\\mathcal{L}(\\mathbf{w}, b, \\boldsymbol{\\alpha}) = \\frac{1}{2} \\|\\mathbf{w}\\|^2 - \\sum_{i=1}^N \\alpha_i \\left[ y_i (\\mathbf{w}^T \\mathbf{x}_i + b) - 1 \\right]
$$

Setting the gradients to zero:
$$
\\nabla_{\\mathbf{w}} \\mathcal{L} = 0 \\implies \\mathbf{w} = \\sum_{i=1}^N \\alpha_i y_i \\mathbf{x}_i
$$
$$
\\frac{\\partial \\mathcal{L}}{\\partial b} = 0 \\implies \\sum_{i=1}^N \\alpha_i y_i = 0
$$

### The Wolfe Dual Problem
Substituting these back eliminates $\\mathbf{w}$ and $b$, yielding the dual problem depending solely on inner products:
$$
\\max_{\\boldsymbol{\\alpha}} \\sum_{i=1}^N \\alpha_i - \\frac{1}{2} \\sum_{i=1}^N \\sum_{j=1}^N \\alpha_i \\alpha_j y_i y_j (\\mathbf{x}_i^T \\mathbf{x}_j)
$$
subject to:
$$
\\alpha_i \\ge 0, \\quad \\sum_{i=1}^N \\alpha_i y_i = 0
$$

### Karush-Kuhn-Tucker (KKT) Complementarity Conditions
At the optimal point:
$$
\\alpha_i^* \\left[ y_i ((\\mathbf{w}^*)^T \\mathbf{x}_i + b^*) - 1 \\right] = 0, \\quad \\forall i
$$
- If $y_i (\\mathbf{w}^T \\mathbf{x}_i + b) > 1 \\implies \\alpha_i = 0$ (sample is non-critical and has zero influence on $\\mathbf{w}$).
- If $\\alpha_i > 0 \\implies y_i (\\mathbf{w}^T \\mathbf{x}_i + b) = 1$ (**Support Vectors** lying precisely on the margin).`,
      },
      {
        title: '3. Soft-Margin SVM, Slack Variables (ξᵢ) & Regularization (C)',
        content: `When data is noisy or overlapping, a hard margin either fails or overfits severely. 

### Slack Variables
We introduce non-negative slack variables $\\xi_i \\ge 0$:
$$
y_i (\\mathbf{w}^T \\mathbf{x}_i + b) \\ge 1 - \\xi_i
$$
- $\\xi_i = 0$: Point lies on or outside the margin (no violation).
- $0 < \\xi_i < 1$: Point is correctly classified, but lies **inside the margin gutter**.
- $\\xi_i = 1$: Point lies directly on the decision boundary.
- $\\xi_i > 1$: Point is **misclassified** on the wrong side.

### Soft-Margin Primal Formulation
$$
\\min_{\\mathbf{w}, b, \\boldsymbol{\\xi}} \\frac{1}{2} \\|\\mathbf{w}\\|^2 + C \\sum_{i=1}^N \\xi_i
$$
subject to:
$$
y_i (\\mathbf{w}^T \\mathbf{x}_i + b) \\ge 1 - \\xi_i, \\quad \\xi_i \\ge 0, \\quad \\forall i
$$

### The Hyperparameter C (Bias-Variance Trade-Off)
- **High $C$ ($C \\to \\infty$)**: Heavy penalty for violations $\\implies$ narrow margin, low bias, **risk of overfitting**.
- **Low $C$ ($C \\to 0$)**: Tolerates violations $\\implies$ wider margin, accepts misclassifications, lower variance, **risk of underfitting**.

### Dual Formulation with Box Constraint
In the dual formulation, the presence of slack variables modifies the constraints into a **box constraint**:
$$
0 \\le \\alpha_i \\le C, \\quad \\forall i
$$
- $0 < \\alpha_i < C$: **Free Support Vectors** lying strictly on the margin plane ($\\xi_i = 0$).
- $\\alpha_i = C$: **Bounded Support Vectors** lying inside the margin or misclassified ($\\xi_i > 0$).`,
      },
      {
        title: '4. The Kernel Trick & Non-Linear Classification (2D to 3D)',
        content: `When data cannot be linearly separated in input space $\\mathbb{R}^d$ (e.g. concentric circles or XOR), we map the input vectors into a higher-dimensional Hilbert space $\\mathcal{H}$ via a non-linear mapping $\\phi(\\mathbf{x})$:
$$
\\phi: \\mathbb{R}^d \\to \\mathcal{H}
$$

### The Kernel Trick
Since the dual problem depends **only on inner products**, we do not need to compute $\\phi(\\mathbf{x})$ explicitly. A **Kernel Function** $K(\\mathbf{x}, \\mathbf{z})$ computes the inner product directly in input space:
$$
K(\\mathbf{x}, \\mathbf{z}) = \\langle \\phi(\\mathbf{x}), \\phi(\\mathbf{z}) \\rangle
$$

### Standard Kernel Functions
1. **Linear Kernel**:
$$
K(\\mathbf{x}, \\mathbf{z}) = \\mathbf{x}^T \\mathbf{z}
$$
2. **Polynomial Kernel**:
$$
K(\\mathbf{x}, \\mathbf{z}) = (\\gamma \\mathbf{x}^T \\mathbf{z} + r)^d
$$
3. **Radial Basis Function (RBF / Gaussian) Kernel**:
$$
K(\\mathbf{x}, \\mathbf{z}) = \\exp\\left( -\\gamma \\|\\mathbf{x} - \\mathbf{z}\\|^2 \\right), \\quad \\gamma = \\frac{1}{2\\sigma^2} > 0
$$
Maps data into an **infinite-dimensional Hilbert space**. The parameter $\\gamma$ controls the radius of influence of each support vector.

### 2D to 3D Paraboloid Mapping Example
For concentric rings in $\\mathbb{R}^2$, consider the mapping:
$$
\\phi(x_1, x_2) = (x_1, x_2, x_1^2 + x_2^2)
$$
In this 3D space, the inner ring points sit at the bottom of the paraboloid bowl ($z \\approx 0$), while outer ring points sit high up on the bowl rim ($z \\gg 0$). A flat horizontal plane $z = c$ cleanly separates both classes!`,
      },
      {
        title: '5. Sequential Minimal Optimization (SMO) Algorithm',
        content: `Standard quadratic programming solvers take $O(N^3)$ time, which is slow for large datasets. John Platt (1998) introduced **Sequential Minimal Optimization (SMO)**.

### Working Principle of SMO:
1. At each iteration, SMO selects **two Lagrange multipliers** $\\alpha_i$ and $\\alpha_j$ to optimize analytically while holding all other $\\alpha_k$ ($k \\ne i, j$) fixed.
2. The linear constraint $\\sum_{k=1}^N \\alpha_k y_k = 0$ reduces the two-variable sub-problem to a 1D optimization along a line segment.
3. The new $\\alpha_j$ is solved in closed form:
$$
\\alpha_j^{\\text{new}} = \\alpha_j^{\\text{old}} - \\frac{y_j (E_i - E_j)}{\\eta}
$$
where $\\eta = 2K(\\mathbf{x}_i, \\mathbf{x}_j) - K(\\mathbf{x}_i, \\mathbf{x}_i) - K(\\mathbf{x}_j, \\mathbf{x}_j)$ and $E_k = f(\\mathbf{x}_k) - y_k$.
4. $\\alpha_j^{\\text{new}}$ is clipped to bounds $[L, H]$ dictated by the box constraint $0 \\le \\alpha \\le C$.
5. $\\alpha_i$ is updated to maintain the equality constraint.
6. The bias $b$ and error cache are updated. This loop repeats until all KKT conditions are satisfied within tolerance $\\text{tol}$.

Because SMO solves sub-problems analytically without matrix inversions, it runs at **60 FPS directly inside the browser client**!`,
      },
    ],
    preTest: [
      {
        id: 'q1',
        question: 'What is the width of the geometric margin in a canonical hard-margin SVM with weight vector w?',
        options: ['1 / ||w||', '2 / ||w||', '||w|| / 2', '2 / ||w||²'],
        correctIndex: 1,
        explanation:
          'The perpendicular distance from the decision boundary to each margin plane is 1/||w||, so the total geometric margin between positive and negative margin planes is 2/||w||.',
      },
      {
        id: 'q2',
        question: 'Which training points determine the orientation and position of the SVM decision boundary?',
        options: [
          'All points in the training set equally',
          'Only points with Lagrange multiplier αᵢ = 0',
          'Only the Support Vectors (points with αᵢ > 0)',
          'The mean centroid of each class',
        ],
        correctIndex: 2,
        explanation:
          'Because w = Σ αᵢ yᵢ xᵢ, data points with αᵢ = 0 have zero weight. Only support vectors (αᵢ > 0) actively shape the hyperplane.',
      },
      {
        id: 'q3',
        question: 'What does the regularization parameter C control in a Soft-Margin SVM?',
        options: [
          'The learning rate of gradient descent',
          'The trade-off between maximizing margin width and penalizing margin violations/slack errors',
          'The polynomial degree of the kernel',
          'The number of clusters in the dataset',
        ],
        correctIndex: 1,
        explanation:
          'C balances margin width against slack penalties: a large C penalizes violations heavily (narrow margin), while a small C tolerates errors (wide margin).',
      },
      {
        id: 'q4',
        question: 'What is the primary computational benefit of the Kernel Trick?',
        options: [
          'It eliminates the need for computing dot products entirely',
          'It computes inner products in high-dimensional Hilbert space without explicitly evaluating coordinate mappings',
          'It converts binary classification into unsupervised clustering',
          'It reduces training time to O(1)',
        ],
        correctIndex: 1,
        explanation:
          'The kernel trick calculates K(x, z) = ⟨ϕ(x), ϕ(z)⟩ directly in input space in O(d) time, bypassing the immense or infinite cost of computing ϕ(x).',
      },
      {
        id: 'q5',
        question: 'What happens when setting an excessively large γ (Gamma) in an RBF Gaussian kernel?',
        options: [
          'The boundary becomes perfectly linear',
          'The Gaussian bells become very narrow, creating tight island-like boundaries around individual points (overfitting)',
          'All support vector weights become zero',
          'The margin expands to infinity',
        ],
        correctIndex: 1,
        explanation:
          'High γ means 1/(2σ²) is large (very narrow Gaussian curves). Each sample creates its own isolated boundary pocket, resulting in extreme overfitting.',
      },
    ],
    postTest: [
      {
        id: 'pq1',
        question: 'Why is an SVM model considered mathematically sparse in its dual representation?',
        options: [
          'It only works on sparse matrix formats',
          'Most training points have αᵢ = 0; only the support vectors must be stored to compute predictions',
          'The weight vector w has mostly zero components',
          'The dataset must have fewer than 100 samples',
        ],
        correctIndex: 1,
        explanation:
          'Dual sparsity means that the decision function depends solely on the support vectors. All non-support vectors can be deleted from memory without altering predictions.',
      },
      {
        id: 'pq2',
        question: 'In a soft-margin SVM, what does a support vector with αᵢ = C signify?',
        options: [
          'The point lies exactly on the margin plane with zero slack (ξᵢ = 0)',
          'The point violates the margin plane or is misclassified, accumulating slack penalty ξᵢ > 0 (bounded SV)',
          'The point has zero influence on the boundary',
          'The point is an outlier that was automatically deleted',
        ],
        correctIndex: 1,
        explanation:
          'When αᵢ = C, the point is a bounded support vector that lies within the margin gutter (0 < ξᵢ ≤ 1) or is misclassified (ξᵢ > 1).',
      },
      {
        id: 'pq3',
        question: 'What is the dimensionality of the feature space induced by the Radial Basis Function (RBF) kernel?',
        options: ['Equal to input dimension d', 'd²', 'd!', 'Infinite dimensional'],
        correctIndex: 3,
        explanation:
          'Because exp(x) has an infinite Taylor series expansion, the Gaussian RBF kernel corresponds to an inner product in an infinite-dimensional Hilbert space.',
      },
      {
        id: 'pq4',
        question: 'How does the Sequential Minimal Optimization (SMO) algorithm achieve high efficiency?',
        options: [
          'By using deep neural backpropagation',
          'By breaking the large QP problem into 2-variable sub-problems solved analytically in closed form',
          'By approximating all kernels with random numbers',
          'By discarding all negative class samples',
        ],
        correctIndex: 1,
        explanation:
          'SMO optimizes two Lagrange multipliers analytically at each step, eliminating costly numerical matrix inversions and enabling fast client-side execution.',
      },
      {
        id: 'pq5',
        question: 'In the 2D to 3D mapping ϕ(x₁, x₂) = (x₁, x₂, x₁² + x₂²), why do concentric circles become linearly separable in 3D?',
        options: [
          'The inner circle points have smaller radius (x₁² + x₂²) and sit at lower heights, while outer points sit higher on the paraboloid bowl',
          'All points are projected to negative coordinates',
          'The outer circle points are deleted',
          'The points are randomly sorted',
        ],
        correctIndex: 0,
        explanation:
          'Inner points have small radius r² and sit low at the base of the paraboloid; outer points have large radius r² and sit high on the rim. A flat horizontal plane cuts between them cleanly.',
      },
    ],
    codeTemplate: '',
    references: [
      {
        title: 'Support-Vector Networks',
        authors: 'Corinna Cortes & Vladimir Vapnik (Machine Learning, 1995)',
        description: 'The seminal paper introducing the soft-margin formulation and support vector networks.',
        url: 'https://link.springer.com/article/10.1007/BF00994018',
      },
      {
        title: 'Sequential Minimal Optimization: A Fast Algorithm for Training Support Vector Machines',
        authors: 'John C. Platt (Microsoft Research Technical Report, 1998)',
        description: 'The breakthrough algorithm that made SVM training fast by solving 2-variable subproblems analytically.',
        url: 'https://www.microsoft.com/en-us/research/publication/sequential-minimal-optimization-a-fast-algorithm-for-training-support-vector-machines/',
      },
      {
        title: 'Pattern Recognition and Machine Learning (Chapter 7: Sparse Kernel Machines)',
        authors: 'Christopher M. Bishop (Springer, 2006)',
        description: 'Comprehensive textbook treatment of maximum margin classifiers, Lagrange duality, and Mercer kernels.',
      },
      {
        title: 'Learning with Kernels: Support Vector Machines, Regularization, Optimization',
        authors: 'Bernhard Schölkopf & Alexander J. Smola (MIT Press, 2002)',
        description: 'The authoritative reference work on reproducing kernel Hilbert spaces (RKHS) and kernel algorithms.',
      },
    ],
  },
];
