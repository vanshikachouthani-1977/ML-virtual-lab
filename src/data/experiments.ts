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
  // ─── EXPERIMENT 1: Hard-Margin Linear SVM ────────────────────────────────────
  {
    id: 'hard-margin-svm',
    number: 1,
    title: 'Hard-Margin Linear SVM & Maximum Margin Hyperplane',
    shortTitle: '1. Hard-Margin Linear SVM',
    description:
      'Formulate the convex quadratic optimization problem for linearly separable data. Maximize the geometric margin 2/||w||, verify KKT complementarity conditions, and discover why only support vectors dictate the decision hyperplane.',
    iconName: 'Maximize2',
    color: '#6366f1',
    defaultParams: {
      C: 100, // Large C behaves as hard margin
      kernelType: 'linear',
      gamma: 1,
      degree: 3,
      coef0: 0,
      epsilon: 0.1,
    },
    datasetPresets: [
      { name: 'Separable Clusters', iconName: 'Compass', generate: generateLinear },
      { name: 'Wide Separation', iconName: 'TrendingUp', generate: generateDiagonal },
      { name: 'Multi-Cluster Split', iconName: 'Boxes', generate: generateClustered },
    ],
    features: ['margin', 'contour'],
    simulationInstructions: {
      objective:
        'Understand how an SVM finds the unique hyperplane that maximizes the geometric distance (margin = 2/||w||) between two linearly separable classes.',
      userActions: [
        'Left-Click anywhere on the canvas to place a positive class sample (y = +1, Indigo dot).',
        'Shift + Left-Click or Right-Click on the canvas to place a negative class sample (y = -1, Rose dot).',
        'Right-Click an existing sample point to delete it from the dataset.',
        'Use the "Dataset Presets" buttons to load standard linearly separable distributions.',
        'Click "Train SVM" or toggle the visual switches to refresh the optimization solver.',
      ],
      visualElements: [
        {
          name: 'Decision Boundary',
          visual: 'Solid Emerald Line',
          meaning: 'The optimal separating hyperplane where wᵀx + b = 0. New points above this line are predicted +1, points below are predicted -1.',
        },
        {
          name: 'Margin Planes',
          visual: 'Dashed Emerald Lines',
          meaning: 'The canonical boundary gutters at wᵀx + b = +1 and wᵀx + b = -1. The perpendicular distance between them is the Total Margin (2/||w||).',
        },
        {
          name: 'Support Vectors',
          visual: 'Glowing Amber Rings',
          meaning: 'The critical data points lying exactly on the margin planes (αᵢ > 0). Moving or deleting any other point does NOT change the decision boundary.',
        },
        {
          name: 'Telemetry Panel',
          visual: 'Right-Side Metric Cards',
          meaning: 'Displays the calculated hyperplane equation (w₁x₁ + w₂x₂ + b = 0), exact Margin Width, and Support Vector count.',
        },
      ],
      guidedTasks: [
        {
          id: 1,
          title: 'Observe Dual Sparsity',
          action: 'Load the "Separable Clusters" preset. Note the number of support vectors (amber rings) compared to total points.',
          observation: 'Notice that out of 50 total points, only 3 or 4 points are glowing amber. Only these points determine the boundary.',
        },
        {
          id: 2,
          title: 'Verify Non-Support Vector Invariance',
          action: 'Add several positive (indigo) points deep inside the positive region, far away from the dashed line.',
          observation: 'The green decision boundary and dashed margin lines do NOT move at all. Their αᵢ values remain zero.',
        },
        {
          id: 3,
          title: 'Perturb a Support Vector',
          action: 'Right-click one of the glowing amber support vectors to delete it.',
          observation: 'The decision boundary immediately shifts or tilts as the optimization solver recalculates the new maximum margin.',
        },
      ],
    },
    theory: [
      {
        title: 'Problem Formulation: Maximum Margin Classifier',
        content: `### 1. Geometric Representation
In an $n$-dimensional Euclidean space, an affine hyperplane is parameterized by a normal vector $\\mathbf{w} \\in \\mathbb{R}^n$ and an intercept (bias) $b \\in \\mathbb{R}$:
$$
\\mathbf{w}^T \\mathbf{x} + b = 0
$$

For a linearly separable binary classification dataset $\\mathcal{D} = \\{(\\mathbf{x}_i, y_i)\\}_{i=1}^N$ with labels $y_i \\in \\{-1, +1\\}$:
- Positive class: $\\mathbf{w}^T \\mathbf{x}_i + b \\ge +1$
- Negative class: $\\mathbf{w}^T \\mathbf{x}_i + b \\le -1$

These two inequalities are unified into the canonical **separating constraint**:
$$
y_i (\\mathbf{w}^T \\mathbf{x}_i + b) \\ge 1, \\quad \\forall i \\in \\{1, 2, \\dots, N\\}
$$

### 2. Derivation of the Geometric Margin
The perpendicular distance from any arbitrary point $\\mathbf{x}$ to the hyperplane is given by projection onto the unit normal $\\frac{\\mathbf{w}}{\\|\\mathbf{w}\\|}$:
$$
\\text{dist}(\\mathbf{x}) = \\frac{|\\mathbf{w}^T \\mathbf{x} + b|}{\\|\\mathbf{w}\\|}
$$

For canonical support vectors lying on the positive margin plane ($\\mathbf{w}^T \\mathbf{x}_+ + b = 1$) and negative margin plane ($\\mathbf{w}^T \\mathbf{x}_- + b = -1$), subtracting the two equations yields:
$$
\\mathbf{w}^T (\\mathbf{x}_+ - \\mathbf{x}_-) = 2 \\implies \\frac{\\mathbf{w}^T}{\\|\\mathbf{w}\\|} (\\mathbf{x}_+ - \\mathbf{x}_-) = \\frac{2}{\\|\\mathbf{w}\\|}
$$
Thus, the total geometric margin between the two classes is:
$$
\\text{Margin} = \\frac{2}{\\|\\mathbf{w}\\|}
$$`,
      },
      {
        title: 'Primal Convex Quadratic Programming Formulation',
        content: `Maximizing the margin $\\frac{2}{\\|\\mathbf{w}\\|}$ is mathematically equivalent to minimizing its reciprocal $\\frac{1}{2} \\|\\mathbf{w}\\|^2$.

### The Primal Problem:
$$
\\min_{\\mathbf{w}, b} \\frac{1}{2} \\|\\mathbf{w}\\|^2
$$
subject to:
$$
y_i (\\mathbf{w}^T \\mathbf{x}_i + b) \\ge 1, \\quad i = 1, \\dots, N
$$

### Mathematical Properties:
1. **Strict Convexity**: The objective function $f(\\mathbf{w}) = \\frac{1}{2} \\mathbf{w}^T \\mathbf{w}$ has a positive definite Hessian matrix (identity $\\mathbf{I}$), guaranteeing a strictly convex objective.
2. **Linear Constraints**: The feasible region is the intersection of half-spaces (a convex polyhedron).
3. **Global Optimum**: Every local minimum is guaranteed to be the unique global minimum.`,
      },
      {
        title: 'Lagrange Dual Formulation & KKT Conditions',
        content: `To solve this constrained optimization problem, we introduce non-negative Lagrange multipliers $\\alpha_i \\ge 0$:
$$
\\mathcal{L}(\\mathbf{w}, b, \\boldsymbol{\\alpha}) = \\frac{1}{2} \\|\\mathbf{w}\\|^2 - \\sum_{i=1}^N \\alpha_i \\left[ y_i(\\mathbf{w}^T \\mathbf{x}_i + b) - 1 \\right]
$$

### Stationarity Conditions:
Setting gradients with respect to primal variables to zero:
$$
\\nabla_{\\mathbf{w}} \\mathcal{L} = \\mathbf{w} - \\sum_{i=1}^N \\alpha_i y_i \\mathbf{x}_i = 0 \\implies \\mathbf{w} = \\sum_{i=1}^N \\alpha_i y_i \\mathbf{x}_i
$$
$$
\\frac{\\partial \\mathcal{L}}{\\partial b} = -\\sum_{i=1}^N \\alpha_i y_i = 0 \\implies \\sum_{i=1}^N \\alpha_i y_i = 0
$$

Substituting these back into $\\mathcal{L}$ yields the **Wolfe Dual Problem**:
$$
\\max_{\\boldsymbol{\\alpha}} \\sum_{i=1}^N \\alpha_i - \\frac{1}{2} \\sum_{i=1}^N \\sum_{j=1}^N \\alpha_i \\alpha_j y_i y_j (\\mathbf{x}_i^T \\mathbf{x}_j)
$$
subject to:
$$
\\alpha_i \\ge 0, \\quad \\sum_{i=1}^N \\alpha_i y_i = 0
$$

### Karush-Kuhn-Tucker (KKT) Complementarity:
At the optimum solution $(\\mathbf{w}^*, b^*, \\boldsymbol{\\alpha}^*)$:
$$
\\alpha_i^* \\left[ y_i ((\\mathbf{w}^*)^T \\mathbf{x}_i + b^*) - 1 \\right] = 0, \\quad \\forall i
$$
- **Case 1 (Non-Support Vectors)**: For points strictly outside the margin gutter ($y_i (\\mathbf{w}^T \\mathbf{x}_i + b) > 1$), complementarity forces $\\alpha_i = 0$.
- **Case 2 (Support Vectors)**: For points where $\\alpha_i > 0$, the constraint is active and strictly tight:
$$
y_i (\\mathbf{w}^T \\mathbf{x}_i + b) = 1
$$
These points lie precisely on the margin and are the **Support Vectors**.`,
      },
    ],
    preTest: [
      {
        id: 'q1',
        question: 'What is the width of the geometric margin in a canonical hard-margin SVM?',
        options: ['1 / ||w||', '2 / ||w||', '||w|| / 2', '2 / ||w||²'],
        correctIndex: 1,
        explanation:
          'The distance from the decision boundary wᵀx + b = 0 to each margin plane is 1/||w||, so the total margin between positive and negative margin planes is 2/||w||.',
      },
      {
        id: 'q2',
        question: 'Which points determine the position and orientation of the SVM decision boundary?',
        options: [
          'All points in the training set equally',
          'Only points with Lagrange multiplier αᵢ = 0',
          'Only the Support Vectors (points with αᵢ > 0)',
          'The centroid of each class',
        ],
        correctIndex: 2,
        explanation:
          'Because w = Σ αᵢ yᵢ xᵢ, data points with αᵢ = 0 contribute nothing to w. Only support vectors (αᵢ > 0) determine the decision hyperplane.',
      },
      {
        id: 'q3',
        question: 'What type of optimization problem is the primal hard-margin SVM?',
        options: [
          'Non-convex unconstrained optimization',
          'Convex quadratic programming with linear constraints',
          'Integer linear programming',
          'Combinatorial search',
        ],
        correctIndex: 1,
        explanation:
          'The objective (1/2 ||w||²) is convex quadratic and the constraints yᵢ(wᵀxᵢ + b) ≥ 1 are linear inequalities, making it a convex QP with a unique global minimum.',
      },
      {
        id: 'q4',
        question: 'If a training sample is far away from the margin on the correct side, what is its αᵢ?',
        options: ['αᵢ = 0', 'αᵢ = 1', 'αᵢ = ∞', 'αᵢ = C'],
        correctIndex: 0,
        explanation:
          'By the KKT complementarity condition αᵢ[yᵢ(wᵀxᵢ + b) - 1] = 0, any point strictly outside the margin boundary has yᵢ(wᵀxᵢ + b) > 1, requiring αᵢ = 0.',
      },
      {
        id: 'q5',
        question: 'What happens if the training data is NOT linearly separable in a hard-margin SVM?',
        options: [
          'The algorithm finds the best approximation with lowest error',
          'The optimization problem has no feasible solution',
          'The weights w automatically converge to zero',
          'The margin expands to infinity',
        ],
        correctIndex: 1,
        explanation:
          'Hard-margin SVM strictly enforces yᵢ(wᵀxᵢ + b) ≥ 1 for all points. If data is not separable, no such w and b exist, making the optimization problem infeasible.',
      },
    ],
    postTest: [
      {
        id: 'pq1',
        question: 'Why is the SVM model considered sparse?',
        options: [
          'It works only on sparse matrices',
          'Most training points have αᵢ = 0, so only a subset (support vectors) is stored',
          'The weight vector w has mostly zero components',
          'The dataset must have fewer than 100 points',
        ],
        correctIndex: 1,
        explanation:
          'Dual sparsity means that the decision function depends solely on the support vectors. All non-support vectors can be deleted from memory without altering the model.',
      },
      {
        id: 'pq2',
        question: 'If you double the distance of all points from the origin (scaling X by 2), what happens to ||w||?',
        options: ['||w|| is halved', '||w|| doubles', '||w|| quadruples', '||w|| remains unchanged'],
        correctIndex: 0,
        explanation:
          'Since yᵢ(wᵀ(2xᵢ) + b) ≥ 1, the new weight w\' must satisfy 2w\' = w, so ||w\'|| = ||w|| / 2. The margin doubles.',
      },
      {
        id: 'pq3',
        question: 'In the dual formulation, the objective function depends on the training data only through:',
        options: [
          'The inverse covariance matrix',
          'Inner products (xᵢᵀ xⱼ)',
          'The eigenvalues of X',
          'The determinant of X',
        ],
        correctIndex: 1,
        explanation:
          'The dual objective only requires evaluating inner products xᵢᵀ xⱼ. This property is what allows the "kernel trick" to replace inner products with non-linear kernels.',
      },
      {
        id: 'pq4',
        question: 'How is the bias parameter b typically calculated once α is found?',
        options: [
          'b = 0 always',
          'Using any support vector on the margin: b = yₖ - wᵀ xₖ',
          'b = Σ yᵢ / N',
          'By gradient descent on b independently',
        ],
        correctIndex: 1,
        explanation:
          'For any support vector xₖ with 0 < αₖ, the constraint is strictly tight: yₖ(wᵀ xₖ + b) = 1. Multiplying both sides by yₖ gives b = yₖ - wᵀ xₖ.',
      },
      {
        id: 'pq5',
        question: 'Adding a new data point deep within the correct classification region (far from the margin) will:',
        options: [
          'Rotate the hyperplane significantly',
          'Have zero effect on the existing hyperplane',
          'Reduce the margin width',
          'Increase the number of support vectors',
        ],
        correctIndex: 1,
        explanation:
          'Since the point lies outside the margin, its constraint is non-binding and its α will be 0. The optimal hyperplane remains completely unchanged.',
      },
    ],
    codeTemplate: '',
    references: [
      {
        title: 'Support-Vector Networks',
        authors: 'Corinna Cortes & Vladimir Vapnik (1995)',
        description: 'The seminal paper introducing support vector networks for binary classification.',
        url: 'https://link.springer.com/article/10.1007/BF00994018',
      },
      {
        title: 'Pattern Recognition and Machine Learning (Chapter 7: Sparse Kernel Machines)',
        authors: 'Christopher M. Bishop',
        description: 'Comprehensive mathematical treatment of maximum margin classifiers and Lagrange duality.',
      },
    ],
  },

  // ─── EXPERIMENT 2: Soft-Margin SVM & Regularization (C Parameter) ───────────
  {
    id: 'soft-margin-svm',
    number: 2,
    title: 'Soft-Margin SVM, Slack Variables & Regularization (C)',
    shortTitle: '2. Soft-Margin SVM & Regularization',
    description:
      'Analyze how soft-margin SVM handles noisy and overlapping data using slack variables (ξᵢ). Explore the trade-off between maximizing margin width and penalizing margin violations controlled by hyperparameter C.',
    iconName: 'Sliders',
    color: '#10b981',
    defaultParams: {
      C: 1.0,
      kernelType: 'linear',
      gamma: 1,
      degree: 3,
      coef0: 0,
      epsilon: 0.1,
    },
    datasetPresets: [
      { name: 'Overlapping Classes', iconName: 'Layers', generate: generateOverlapping },
      { name: 'Clusters with Outliers', iconName: 'Boxes', generate: generateClustered },
      { name: 'Separable Base', iconName: 'Compass', generate: generateLinear },
    ],
    features: ['margin', 'contour', 'c-slider'],
    simulationInstructions: {
      objective:
        'Observe how the regularization parameter C balances the trade-off between a wide margin (tolerating errors) and a narrow margin (penalizing errors).',
      userActions: [
        'Load the "Overlapping Classes" preset to view data points that cross into opposing territory.',
        'Use the "C (Regularization)" slider to vary C across 6 orders of magnitude (from 0.001 to 1000).',
        'Add isolated outlier points using Shift-Click inside the opposite class cluster.',
        'Observe how the decision line and margin width change as C increases or decreases.',
      ],
      visualElements: [
        {
          name: 'C Parameter Slider',
          visual: 'Logarithmic Slider (0.001 to 1000)',
          meaning: 'High C = heavy penalty for violations (narrow margin, risk of overfitting). Low C = high tolerance (wide margin, risk of underfitting).',
        },
        {
          name: 'Margin Width (2/||w||)',
          visual: 'Telemetry Stat',
          meaning: 'Expands when C is small; contracts when C is large.',
        },
        {
          name: 'Bounded Support Vectors',
          visual: 'Points with αᵢ = C',
          meaning: 'Points that fall inside the margin gutter or are misclassified, each accumulating slack penalty ξᵢ > 0.',
        },
        {
          name: 'Free Support Vectors',
          visual: 'Points with 0 < αᵢ < C',
          meaning: 'Points lying exactly on the margin plane (ξᵢ = 0), anchoring the orientation of the boundary.',
        },
      ],
      guidedTasks: [
        {
          id: 1,
          title: 'Simulate Underfitting (Low C)',
          action: 'Set C to 0.01. Observe the margin width and the classification accuracy.',
          observation: 'The margin becomes very wide. The model tolerates overlapping points gracefully without over-reacting.',
        },
        {
          id: 2,
          title: 'Simulate Overfitting (High C)',
          action: 'Increase C to 500 or 1000.',
          observation: 'The margin shrinks dramatically as the boundary bends or shifts aggressively to avoid misclassifying individual noise points.',
        },
        {
          id: 3,
          title: 'Introduce an Outlier',
          action: 'At C = 100, add a single negative point deep inside the positive cluster. Then drop C to 0.1.',
          observation: 'At C = 100, the boundary severely distorts to classify that outlier. At C = 0.1, the boundary ignores the outlier and keeps the general trend.',
        },
      ],
    },
    theory: [
      {
        title: 'Motivation: Noise, Outliers & Non-Separability',
        content: `In practical engineering scenarios, real data is rarely perfectly linearly separable due to measurement noise, feature overlap, or outliers. A hard-margin SVM either:
1. Fails completely (no feasible solution exists), or
2. Overfits drastically by narrowing the margin to accommodate a single rogue outlier.

To resolve this, Cortes and Vapnik (1995) introduced **slack variables** $\\xi_i \\ge 0$ allowing samples to violate the margin boundary.`,
      },
      {
        title: 'Soft-Margin Primal Formulation & Slack Variables',
        content: `Each training sample $(\\mathbf{x}_i, y_i)$ is permitted a slack $\\xi_i \\ge 0$:
$$
y_i (\\mathbf{w}^T \\mathbf{x}_i + b) \\ge 1 - \\xi_i
$$

### Interpretation of Slack Values:
- $\\xi_i = 0$: Point lies on or outside the correct margin plane (no violation).
- $0 < \\xi_i < 1$: Point is correctly classified, but lies **inside the margin gutter**.
- $\\xi_i = 1$: Point lies directly on the decision boundary $\\mathbf{w}^T \\mathbf{x}_i + b = 0$.
- $\\xi_i > 1$: Point is **misclassified** on the wrong side of the decision boundary.

The **Soft-Margin Optimization Problem** balances margin maximization with violation penalties:
$$
\\min_{\\mathbf{w}, b, \\boldsymbol{\\xi}} \\frac{1}{2} \\|\\mathbf{w}\\|^2 + C \\sum_{i=1}^N \\xi_i
$$
subject to:
$$
y_i(\\mathbf{w}^T \\mathbf{x}_i + b) \\ge 1 - \\xi_i, \\quad \\xi_i \\ge 0, \\quad \\forall i
$$`,
      },
      {
        title: 'The Regularization Hyperparameter C & Hinge Loss',
        content: `The hyperparameter $C > 0$ acts as a regularization knob:

### Bias-Variance Tradeoff:
- **Large $C$ ($C \\to \\infty$)**: Heavy penalty for violations. Prioritizes classifying all training points correctly $\\implies$ narrower margin, lower bias, **higher variance (risk of overfitting)**.
- **Small $C$ ($C \\to 0$)**: Light penalty for violations. Prioritizes maximizing margin width $\\implies$ wider margin, accepts more misclassifications, higher bias, **lower variance (risk of underfitting)**.

### Hinge Loss View
The soft-margin problem can be reformulated as unconstrained optimization using the **Hinge Loss**:
$$
\\min_{\\mathbf{w}, b} \\sum_{i=1}^N \\max(0, 1 - y_i(\\mathbf{w}^T \\mathbf{x}_i + b)) + \\frac{1}{2C} \\|\\mathbf{w}\\|^2
$$

### Dual Formulation with Box Constraint
In the Wolfe Dual, the slack formulation introduces an upper bound ("box constraint") on the multipliers:
$$
0 \\le \\alpha_i \\le C, \\quad \\forall i
$$
- If $\\alpha_i = 0$: Point is correctly classified outside the margin.
- If $0 < \\alpha_i < C$: Point is a **free support vector** lying exactly on the margin plane ($y_i(w^Tx_i+b)=1, \\xi_i=0$).
- If $\\alpha_i = C$: Point is a **bounded support vector** violating the margin ($y_i(w^Tx_i+b) < 1, \\xi_i > 0$).`,
      },
    ],
    preTest: [
      {
        id: 's1',
        question: 'What is the role of slack variables ξᵢ in soft-margin SVM?',
        options: [
          'They measure the gradient of the loss function',
          'They allow data points to violate the margin boundary or be misclassified',
          'They determine the learning rate of the optimizer',
          'They convert binary classification to multi-class',
        ],
        correctIndex: 1,
        explanation:
          'Slack variables ξᵢ ≥ 0 quantify the distance by which a data point violates the ideal margin constraint yᵢ(wᵀxᵢ + b) ≥ 1.',
      },
      {
        id: 's2',
        question: 'If a data point has slack value ξᵢ = 1.5, what does this indicate?',
        options: [
          'The point is on the margin plane',
          'The point is correctly classified inside the margin',
          'The point is misclassified on the wrong side of the decision boundary',
          'The point is an outlier that was automatically deleted',
        ],
        correctIndex: 2,
        explanation:
          'For ξᵢ = 1, the point is on the decision boundary. For ξᵢ > 1, the point has crossed the decision boundary into the opposing class region (misclassified).',
      },
      {
        id: 's3',
        question: 'What happens when C is set to an extremely large value (e.g., C = 10,000)?',
        options: [
          'The margin becomes very wide and permits many misclassifications',
          'The algorithm acts like a hard-margin SVM, penalizing violations severely',
          'All αᵢ become zero',
          'The decision boundary disappears',
        ],
        correctIndex: 1,
        explanation:
          'Large C heavily penalizes slack violations, forcing the optimizer to minimize errors at the expense of a narrower margin (approaching hard-margin behavior).',
      },
      {
        id: 's4',
        question: 'What is the upper bound on the Lagrange multipliers αᵢ in the dual soft-margin SVM?',
        options: ['1.0', 'C', '||w||²', '∞'],
        correctIndex: 1,
        explanation:
          'The dual constraints for soft-margin SVM are 0 ≤ αᵢ ≤ C. This is known as the box constraint, preventing any single point from exerting infinite influence.',
      },
      {
        id: 's5',
        question: 'Which loss function is implicitly minimized by the soft-margin SVM?',
        options: ['Cross-Entropy Loss', 'Hinge Loss', 'Mean Squared Error', 'Huber Loss'],
        correctIndex: 1,
        explanation:
          'Soft-margin SVM minimizes the Hinge Loss L(y, f(x)) = max(0, 1 - y·f(x)) combined with an L2 regularization penalty on weights.',
      },
    ],
    postTest: [
      {
        id: 'sp1',
        question: 'How do you detect overfitting in an SVM by inspecting the C parameter?',
        options: [
          'Very small C produces complex jagged boundaries',
          'Very large C fits noisy points closely, yielding high training accuracy but poor validation accuracy',
          'Overfitting only occurs when C = 0',
          'C has no relationship to overfitting',
        ],
        correctIndex: 1,
        explanation:
          'A high C forces the decision boundary to bend or position tightly around outliers, leading to high training accuracy but degraded generalization on unseen test data.',
      },
      {
        id: 'sp2',
        question: 'A support vector with 0 < αᵢ < C is guaranteed to have:',
        options: [
          'Slack ξᵢ > 0',
          'Slack ξᵢ = 0 (lies precisely on the margin boundary)',
          'Slack ξᵢ = 1',
          'Misclassification error',
        ],
        correctIndex: 1,
        explanation:
          'When 0 < αᵢ < C, the point is a free support vector on the margin boundary with zero slack (ξᵢ = 0). Points with αᵢ = C are bounded support vectors with ξᵢ > 0.',
      },
      {
        id: 'sp3',
        question: 'In a dataset with significant label noise, what is the recommended strategy for C?',
        options: [
          'Increase C to force correct classification of noisy labels',
          'Decrease C to tolerate noisy points and maintain a robust, wider margin',
          'Set C = ∞ to enforce hard margins',
          'Set C = 0 to ignore all data points',
        ],
        correctIndex: 1,
        explanation:
          'Decreasing C makes the model tolerant of mislabeled or noisy samples, preventing the boundary from being distorted by noise.',
      },
      {
        id: 'sp4',
        question: 'What happens to the number of support vectors as C increases on overlapping data?',
        options: [
          'The number of support vectors generally decreases',
          'The number of support vectors always increases to N',
          'The number of support vectors is invariant to C',
          'All points become support vectors',
        ],
        correctIndex: 0,
        explanation:
          'As C increases, the penalty for violations grows, narrowing the margin gutter. Fewer points fall inside the narrower margin, typically reducing the total count of SVs.',
      },
      {
        id: 'sp5',
        question: 'The term 1/2 ||w||² in the objective function acts as:',
        options: [
          'L1 regularization (Lasso)',
          'L2 regularization (Ridge penalty), preventing overly complex boundaries',
          'Elastic Net penalty',
          'Data augmentation',
        ],
        correctIndex: 1,
        explanation:
          'The 1/2 ||w||² penalty corresponds to L2 regularization on the weight vector, which maximizes the margin and controls model capacity.',
      },
    ],
    codeTemplate: '',
    references: [
      {
        title: 'Support-Vector Networks (Soft Margin Formulation)',
        authors: 'Corinna Cortes & Vladimir Vapnik',
        description: 'First introduced the soft-margin extension using slack variables.',
      },
      {
        title: 'Statistical Learning Theory',
        authors: 'Vladimir N. Vapnik (1998)',
        description: 'Foundational textbook on Structural Risk Minimization and margin bounds.',
      },
    ],
  },

  // ─── EXPERIMENT 3: Non-Linear SVM & The Kernel Trick ─────────────────────────
  {
    id: 'kernel-trick',
    number: 3,
    title: 'Non-Linear SVM & The Kernel Trick (2D to 3D)',
    shortTitle: '3. Kernel Trick & Non-Linear SVM',
    description:
      'Learn how non-linearly separable data in 2D (concentric circles, XOR, spirals) is implicitly projected into high-dimensional Hilbert spaces. Compare Linear, Polynomial, and Radial Basis Function (RBF) kernels with interactive 3D feature space views.',
    iconName: 'Cpu',
    color: '#06b6d4',
    defaultParams: {
      C: 1.0,
      kernelType: 'rbf',
      gamma: 1.0,
      degree: 3,
      coef0: 1,
      epsilon: 0.1,
    },
    datasetPresets: [
      { name: 'Concentric Rings', iconName: 'Target', generate: generateCircles },
      { name: 'XOR Problem', iconName: 'Grid', generate: generateXOR },
      { name: 'Interlocking Moons', iconName: 'Moon', generate: generateMoons },
      { name: 'Spiral Manifold', iconName: 'RotateCw', generate: generateSpiral },
    ],
    features: ['margin', 'contour', 'kernel-switch', 'c-slider', 'gamma-slider', 'degree-slider', '3d-view'],
    simulationInstructions: {
      objective:
        'Understand how kernel functions compute dot products in higher-dimensional spaces, enabling linear separation of complex non-linear patterns.',
      userActions: [
        'Load the "Concentric Rings" preset. First observe the failure of a Linear Kernel.',
        'Switch the Kernel Function to "RBF (Gaussian)" and watch the decision boundary seamlessly wrap into a circle.',
        'Toggle between "2D Decision Plane" and "3D Kernel Feature Space" using the top mode switch.',
        'In 3D view: Click and drag to rotate the camera. Adjust "Slice Z" to see how a flat plane separates the elevated points.',
        'Experiment with the γ (Gamma) slider: observe the effect of small gamma vs large gamma.',
      ],
      visualElements: [
        {
          name: 'Kernel Selector',
          visual: 'Linear / Polynomial / RBF',
          meaning: 'Selects the implicit feature mapping function K(x, z).',
        },
        {
          name: 'γ (Gamma) Slider',
          visual: 'Logarithmic Slider (0.001 to 100)',
          meaning: 'Controls the radius of influence of each support vector in RBF kernel. High γ creates tight islands around points.',
        },
        {
          name: '3D Kernel Feature Space',
          visual: 'Interactive 3D Canvas',
          meaning: 'Shows points lifted onto a paraboloid surface z = x₁² + x₂² sliced by a 2D plane at height z.',
        },
        {
          name: 'Decision Contour Heatmap',
          visual: 'Smooth Blue/Red Shading',
          meaning: 'Visualizes the continuous signed decision value f(x) over the entire 2D coordinate plane.',
        },
      ],
      guidedTasks: [
        {
          id: 1,
          title: 'The XOR / Concentric Failure of Linear Kernel',
          action: 'Load "Concentric Rings", set Kernel to "Linear". Note the accuracy and boundary.',
          observation: 'A straight line cannot separate an inner ring from an outer ring; accuracy is stuck around 50%.',
        },
        {
          id: 2,
          title: 'Activate RBF Kernel & Inspect 3D',
          action: 'Switch to "RBF (Gaussian)". Toggle into "3D Kernel Feature Space". Drag to rotate.',
          observation: 'In 3D, inner points sit low in the bowl, outer points sit high on the rim. A flat green slice cleanly separates them.',
        },
        {
          id: 3,
          title: 'Observe RBF Overfitting with High Gamma',
          action: 'Switch back to 2D view. Increase γ from 1.0 to 50 or 100.',
          observation: 'The boundary breaks apart into isolated circular islands around individual points, demonstrating severe overfitting.',
        },
      ],
    },
    theory: [
      {
        title: 'The Limitation of Linear Classifiers',
        content: `Many real-world datasets cannot be separated by a flat hyperplane. Classic examples include:
- **Concentric Circles**: Inner ring vs outer ring.
- **XOR Logic Problem**: Positive at $(1, 1)$ and $(-1, -1)$; negative at $(1, -1)$ and $(-1, 1)$.

A linear SVM in the input space $\\mathbb{R}^2$ achieves at most 50% accuracy on XOR.

### Cover\'s Theorem on Separability
Cover\'s Theorem states: *A complex pattern classification problem cast in high-dimensional space non-linearly is more likely to be linearly separable than in a low-dimensional space.*`,
      },
      {
        title: 'Feature Mapping & The Kernel Trick',
        content: `Suppose we map input vectors $\\mathbf{x} \\in \\mathbb{R}^d$ into a higher-dimensional feature space $\\mathcal{H}$ via a non-linear mapping:
$$
\\phi: \\mathbb{R}^d \\to \\mathcal{H}
$$

In the dual formulation, data points **only appear inside dot products**:
$$
\\max_{\\boldsymbol{\\alpha}} \\sum_{i=1}^N \\alpha_i - \\frac{1}{2} \\sum_{i=1}^N \\sum_{j=1}^N \\alpha_i \\alpha_j y_i y_j \\langle \\phi(\\mathbf{x}_i), \\phi(\\mathbf{x}_j) \\rangle
$$

### The Kernel Trick
Computing $\\phi(\\mathbf{x})$ explicitly can be computationally prohibitive or infinite-dimensional. A **Kernel Function** $K(\\mathbf{x}, \\mathbf{z})$ computes the inner product directly in input space without ever calculating $\\phi(\\mathbf{x})$ explicitly:
$$
K(\\mathbf{x}, \\mathbf{z}) = \\langle \\phi(\\mathbf{x}), \\phi(\\mathbf{z}) \\rangle
$$

### Concrete 2D $\\to$ 3D Example (Concentric Circles)
Given $\\mathbf{x} = (x_1, x_2)$, define the mapping $\\phi(\\mathbf{x}) = (x_1^2, \\sqrt{2}x_1x_2, x_2^2)$.
The inner product is:
$$
\\langle \\phi(\\mathbf{x}), \\phi(\\mathbf{z}) \\rangle = x_1^2 z_1^2 + 2x_1x_2z_1z_2 + x_2^2 z_2^2 = (x_1z_1 + x_2z_2)^2 = (\\mathbf{x}^T \\mathbf{z})^2
$$
This matches the degree-2 polynomial kernel! In the 3D space, concentric circles elevate onto a bowl (paraboloid), where a flat horizontal plane easily separates the classes.`,
      },
      {
        title: 'Common Kernel Functions & Mercer\'s Theorem',
        content: `### 1. Linear Kernel
$$
K(\\mathbf{x}, \\mathbf{z}) = \\mathbf{x}^T \\mathbf{z}
$$
Useful when the number of features is very large compared to samples (e.g., text categorization, bioinformatics).

### 2. Polynomial Kernel
$$
K(\\mathbf{x}, \\mathbf{z}) = (\\gamma \\mathbf{x}^T \\mathbf{z} + r)^d
$$
Constructs all monomial combinations of degree up to $d$.

### 3. Radial Basis Function (RBF / Gaussian) Kernel
$$
K(\\mathbf{x}, \\mathbf{z}) = \\exp\\left( -\\gamma \\|\\mathbf{x} - \\mathbf{z}\\|^2 \\right), \\quad \\gamma = \\frac{1}{2\\sigma^2} > 0
$$
- Maps into an **infinite-dimensional Hilbert space** (by Taylor expansion of exponential).
- **Hyperparameter $\\gamma$**: Controls the radius of influence of each support vector.
  - Large $\\gamma$: Narrow bell curve. Leads to complex, island-like decision boundaries around individual points (**overfitting**).
  - Small $\\gamma$: Broad Gaussian curves. Leads to smoother, nearly linear boundaries (**underfitting**).

### Mercer\'s Theorem
A symmetric function $K(\\mathbf{x}, \\mathbf{z})$ is a valid kernel if and only if its Gram matrix $\\mathbf{K}_{ij} = K(\\mathbf{x}_i, \\mathbf{x}_j)$ is **positive semi-definite** for all possible datasets.`,
      },
    ],
    preTest: [
      {
        id: 'k1',
        question: 'What is the core computational benefit of the Kernel Trick?',
        options: [
          'It eliminates the need to compute dot products',
          'It computes inner products in high-dimensional feature space without explicitly calculating coordinates in that space',
          'It turns SVM from supervised into unsupervised learning',
          'It reduces the training time to O(1)',
        ],
        correctIndex: 1,
        explanation:
          'The kernel trick calculates K(x, z) = ⟨ϕ(x), ϕ(z)⟩ directly in input space in O(d) time, avoiding the high or infinite cost of constructing ϕ(x).',
      },
      {
        id: 'k2',
        question: 'What is the dimensionality of the feature space induced by the RBF (Gaussian) kernel?',
        options: ['Equal to input dimension d', 'd²', 'd!', 'Infinite dimensional'],
        correctIndex: 3,
        explanation:
          'Because exp(x) has an infinite Taylor series expansion, the Gaussian RBF kernel corresponds to an inner product in an infinite-dimensional Hilbert space.',
      },
      {
        id: 'k3',
        question: 'What condition must a mathematical function satisfy to be a valid Mercer kernel?',
        options: [
          'It must be strictly negative everywhere',
          'Its Gram matrix must be symmetric positive semi-definite',
          'It must be linear and monotonic',
          'Its integral over all space must equal 1',
        ],
        correctIndex: 1,
        explanation:
          'Mercer\'s theorem states that any continuous, symmetric, positive semi-definite kernel function corresponds to an inner product in some feature space.',
      },
      {
        id: 'k4',
        question: 'How does setting a very large γ (gamma) affect an RBF kernel SVM?',
        options: [
          'Produces a nearly linear decision boundary',
          'Causes tight island-like boundaries around training points, leading to severe overfitting',
          'Sets all support vector weights to zero',
          'Reduces the number of support vectors',
        ],
        correctIndex: 1,
        explanation:
          'High γ means 1/2σ² is large (very narrow Gaussian bells). Each training sample creates its own tight decision boundary island, resulting in extreme overfitting.',
      },
      {
        id: 'k5',
        question: 'For the XOR problem in 2D, which kernel cannot achieve 100% accuracy?',
        options: ['Linear kernel', 'Polynomial kernel (degree 2)', 'RBF kernel', 'Sigmoid kernel with tuned parameters'],
        correctIndex: 0,
        explanation:
          'The XOR problem is fundamentally non-linearly separable in 2D. A linear kernel cannot produce a non-linear boundary and fails on XOR.',
      },
    ],
    postTest: [
      {
        id: 'kp1',
        question: 'Why does the decision function f(x) = sgn(Σ αᵢ yᵢ K(xᵢ, x) + b) execute fast at test time?',
        options: [
          'Because it only sums over the support vectors, not all training points',
          'Because it does not involve any multiplication',
          'Because αᵢ are all equal to 1',
          'Because it runs without computing b',
        ],
        correctIndex: 0,
        explanation:
          'Sparsity means αᵢ = 0 for all non-support vectors. The summation evaluates only across the support vectors, making test inference very fast.',
      },
      {
        id: 'kp2',
        question: 'When should you prefer a Linear Kernel over an RBF Kernel?',
        options: [
          'When the number of features d is much greater than the number of samples N (e.g., text or genomics)',
          'When data has concentric circles',
          'When accuracy is unimportant',
          'Linear kernel should never be used',
        ],
        correctIndex: 0,
        explanation:
          'When d >> N (like 10,000 features and 500 samples), data is already in a high-dimensional space and is almost certainly linearly separable, making linear kernel faster and less prone to overfitting.',
      },
      {
        id: 'kp3',
        question: 'In the 2D to 3D mapping ϕ(x) = (x₁², √2 x₁ x₂, x₂²), concentric circles become separable because:',
        options: [
          'The inner circle points have smaller x₁² + x₂² values and sit at lower heights in the 3rd dimension',
          'The points are projected to negative coordinates',
          'The classes are randomly shuffled',
          'The outer circle is discarded',
        ],
        correctIndex: 0,
        explanation:
          'Inner points have small radius r² = x₁² + x₂², so they occupy the bottom of the paraboloid bowl, while outer points sit high up on the bowl rim. A flat horizontal plane cuts between them.',
      },
      {
        id: 'kp4',
        question: 'Which pair of hyperparameters must be simultaneously tuned for an RBF SVM using cross-validation?',
        options: ['(C, γ)', '(α, b)', '(w, ξ)', '(tol, max_iter)'],
        correctIndex: 0,
        explanation:
          'C (regularization penalty) and γ (kernel bandwidth) jointly dictate the bias-variance trade-off in RBF SVMs and are typically optimized via grid search.',
      },
      {
        id: 'kp5',
        question: 'What is the value of K(x, x) for any point x when using an RBF Gaussian kernel?',
        options: ['0', '1', 'γ', '∞'],
        correctIndex: 1,
        explanation:
          'K(x, x) = exp(-γ ||x - x||²) = exp(-γ · 0) = exp(0) = 1. Every point has a self-similarity score of exactly 1 in the RBF kernel.',
      },
    ],
    codeTemplate: '',
    references: [
      {
        title: 'A Training Algorithm for Optimal Margin Classifiers (COLT \'92)',
        authors: 'Bernhard E. Boser, Isabelle M. Guyon, & Vladimir N. Vapnik',
        description: 'First introduced the kernel trick to support vector machines.',
        url: 'https://dl.acm.org/doi/10.1145/130385.130401',
      },
      {
        title: 'Learning with Kernels: Support Vector Machines, Regularization, Optimization',
        authors: 'Bernhard Schölkopf & Alexander J. Smola',
        description: 'The definitive textbook on kernel methods and reproducing kernel Hilbert spaces (RKHS).',
      },
    ],
  },

  // ─── EXPERIMENT 4: Multi-Class SVM Classification ───────────────────────────
  {
    id: 'multiclass-svm',
    number: 4,
    title: 'Multi-Class SVM: One-vs-Rest (OvR) & One-vs-One (OvO)',
    shortTitle: '4. Multi-Class SVM Strategies',
    description:
      'Extend binary SVM classification to multi-class problems. Compare One-vs-Rest (OvR) and One-vs-One (OvO) decomposition heuristics, evaluate computational scaling with K classes, and visualize decision boundaries.',
    iconName: 'Boxes',
    color: '#f59e0b',
    defaultParams: {
      C: 1.0,
      kernelType: 'rbf',
      gamma: 0.8,
      degree: 3,
      coef0: 0,
      epsilon: 0.1,
    },
    datasetPresets: [
      { name: 'Multi-Cluster Distribution', iconName: 'Boxes', generate: generateClustered },
      { name: 'XOR Multi-Region', iconName: 'Grid', generate: generateXOR },
      { name: 'Interlocking Moons', iconName: 'Moon', generate: generateMoons },
    ],
    features: ['margin', 'contour', 'kernel-switch', 'c-slider', 'gamma-slider', 'multi-class'],
    simulationInstructions: {
      objective:
        'Understand how binary SVM classifiers are assembled to segment multi-class data into distinct decision regions.',
      userActions: [
        'Load the "Multi-Cluster Distribution" dataset to visualize multiple data clusters.',
        'Adjust the RBF γ slider to watch how decision partitions form boundaries around each cluster.',
        'Add test points in ambiguous boundary zones to observe how the decision function resolves class membership.',
        'Switch between RBF and Polynomial kernels to compare linear piecewise vs smooth curved boundaries.',
      ],
      visualElements: [
        {
          name: 'Multi-Class Decision Regions',
          visual: 'Colored Background Contours',
          meaning: 'Shows which class holds the maximum continuous decision confidence score at each coordinate.',
        },
        {
          name: 'OvR Classifier Count',
          visual: 'K Classifiers',
          meaning: 'One binary model per class (compares class k against all other K-1 classes combined).',
        },
        {
          name: 'OvO Classifier Count',
          visual: 'K(K-1)/2 Classifiers',
          meaning: 'Pairwise binary models; final classification determined by majority voting across all pairs.',
        },
      ],
      guidedTasks: [
        {
          id: 1,
          title: 'Examine Multi-Cluster Boundaries',
          action: 'Load "Multi-Cluster Distribution". Keep Kernel = RBF with γ = 0.8.',
          observation: 'Notice how the decision contour forms clear boundaries separating the distinct clusters.',
        },
        {
          id: 2,
          title: 'Calculate Scaling for K = 5 Classes',
          action: 'Review the theory tab for OvO vs OvR formulas when K = 5.',
          observation: 'OvR requires 5 models; OvO requires 5(4)/2 = 10 models. OvO models train faster on smaller subsets.',
        },
      ],
    },
    theory: [
      {
        title: 'The Multi-Class Challenge in SVM',
        content: `Standard SVM is fundamentally formulated as a binary classifier:
$$
f(\\mathbf{x}) = \\text{sgn}(\\mathbf{w}^T \\phi(\\mathbf{x}) + b) \\in \\{-1, +1\\}
$$

When solving a $K$-class problem ($y \\in \\{1, 2, \\dots, K\\}$ with $K > 2$), the problem must be decomposed into a set of binary classifiers. The two canonical approaches are:
1. **One-vs-Rest (OvR)**, also known as One-vs-All (OvA).
2. **One-vs-One (OvO)**.`,
      },
      {
        title: 'One-vs-Rest (OvR) Strategy',
        content: `In the One-vs-Rest approach:
- We train **$K$ separate binary classifiers**, one for each class.
- Classifier $k$ treats class $k$ as the positive class ($+1$) and all other $K-1$ classes combined as negative ($-1$).
- Decision function for classifier $k$:
$$
f_k(\\mathbf{x}) = \\mathbf{w}_k^T \\phi(\\mathbf{x}) + b_k
$$

### Final Classification Rule
An unseen point $\\mathbf{x}$ is assigned to the class with the **highest confidence score** (maximum margin distance):
$$
\\hat{y} = \\arg\\max_{k \\in \\{1, \\dots, K\\}} f_k(\\mathbf{x})
$$

### Characteristics:
- Number of classifiers: **$K$**
- Training set size per classifier: $N$ (entire dataset)
- Drawbacks: Class imbalance during training (1 class vs $K-1$ classes combined) and uncalibrated decision value scales across classifiers.`,
      },
      {
        title: 'One-vs-One (OvO) Strategy',
        content: `In the One-vs-One approach:
- We train a binary classifier for **every distinct pair of classes $(i, j)$** with $i < j$.
- Each classifier $f_{ij}(\\mathbf{x})$ is trained strictly on data from class $i$ and class $j$, ignoring all other data points.

### Voting Mechanism
- For each test sample, all classifiers vote.
- If $f_{ij}(\\mathbf{x}) > 0$, class $i$ receives a vote; otherwise class $j$ receives a vote.
- The sample is assigned to the class with the **plurality of votes**:
$$
\\hat{y} = \\arg\\max_{k} \\sum_{j \\ne k} \\text{vote}_{kj}(\\mathbf{x})
$$

### Characteristics:
- Number of classifiers: **$\\frac{K(K-1)}{2}$**
- Training set size per classifier: approximately $\\frac{2N}{K}$ (much smaller subsets)
- This is the default strategy employed by **LIBSVM** and \`sklearn.svm.SVC\` because quadratic programming scales faster than linearly with sample size.`,
      },
    ],
    preTest: [
      {
        id: 'm1',
        question: 'How many binary classifiers are required to solve a 10-class problem using One-vs-Rest (OvR)?',
        options: ['10', '45', '90', '100'],
        correctIndex: 0,
        explanation:
          'One-vs-Rest trains exactly 1 classifier per class. For K = 10 classes, it trains K = 10 classifiers.',
      },
      {
        id: 'm2',
        question: 'How many binary classifiers are required to solve a 10-class problem using One-vs-One (OvO)?',
        options: ['10', '45', '90', '100'],
        correctIndex: 1,
        explanation:
          'One-vs-One trains K(K - 1)/2 classifiers. For K = 10, that is 10 × 9 / 2 = 45 classifiers.',
      },
      {
        id: 'm3',
        question: 'What is a major disadvantage of One-vs-Rest when K is large?',
        options: [
          'It cannot use non-linear kernels',
          'Severe class imbalance during training, since 1 class is compared against K - 1 classes combined',
          'It requires solving an NP-hard problem',
          'The number of classifiers grows exponentially',
        ],
        correctIndex: 1,
        explanation:
          'If there are 20 classes of equal size, each OvR classifier trains on 5% positive examples and 95% negative examples, creating severe class imbalance.',
      },
      {
        id: 'm4',
        question: 'Which multi-class strategy is used by default in Scikit-Learn\'s SVC (based on LIBSVM)?',
        options: ['One-vs-Rest (OvR)', 'One-vs-One (OvO)', 'Direct K-class QP', 'Softmax cross-entropy'],
        correctIndex: 1,
        explanation:
          'Scikit-Learn\'s SVC uses the OvO (One-vs-One) strategy implemented in LIBSVM because training many small SVMs is faster than a few large ones.',
      },
      {
        id: 'm5',
        question: 'How does OvO resolve the final predicted class label for a test sample?',
        options: [
          'Average of all bias terms',
          'Majority voting across all pairwise classifiers',
          'Selecting the classifier with the highest α',
          'Random tie-breaking always',
        ],
        correctIndex: 1,
        explanation:
          'Each of the K(K-1)/2 classifiers casts a vote for one of the two classes it compares; the class receiving the most total votes wins.',
      },
    ],
    postTest: [
      {
        id: 'mp1',
        question: 'Even though OvO trains more classifiers than OvR (45 vs 10 for K=10), why can OvO be faster to train?',
        options: [
          'Because OvO skips kernel calculations',
          'Because SVM training scales super-linearly with data size (O(N²)), and OvO trains on small subsets (2N/K)',
          'Because OvO uses CPU multi-threading while OvR cannot',
          'Because OvO does not compute support vectors',
        ],
        correctIndex: 1,
        explanation:
          'Since SVM training scales between O(N²) and O(N³), training 45 classifiers on 2N/K data points each is often significantly faster than training 10 classifiers on the full dataset of size N.',
      },
      {
        id: 'mp2',
        question: 'What happens in OvR when multiple classifiers output a positive value (fₖ(x) > 0) for a test sample?',
        options: [
          'An error is thrown',
          'The class with the largest continuous margin score argmax fₖ(x) is chosen',
          'The sample is discarded',
          'A random class is selected',
        ],
        correctIndex: 1,
        explanation:
          'Continuous real-valued decision scores fₖ(x) = wₖᵀx + bₖ represent confidence. The class with the largest positive distance is selected.',
      },
      {
        id: 'mp3',
        question: 'In OvO classification, what is a potential ambiguity in the voting process?',
        options: [
          'Support vectors are shared across all classifiers',
          'Ties can occur when multiple classes receive the exact same number of votes',
          'The bias term cannot be computed',
          'Kernels cannot be evaluated pairwise',
        ],
        correctIndex: 1,
        explanation:
          'Ties can occur when two or more classes tie in the vote tally. Tie-breaking typically falls back to evaluating pairwise decision confidence.',
      },
      {
        id: 'mp4',
        question: 'Which method natively extends SVM to multi-class without decomposing into binary problems?',
        options: [
          'Crammer-Singer multi-class formulation',
          'Polynomial kernel expansion',
          'SMO algorithm',
          'Lagrange dual elimination',
        ],
        correctIndex: 0,
        explanation:
          'The Crammer and Singer (2001) formulation solves a single large quadratic program considering all K classes simultaneously, though it is computationally heavier.',
      },
      {
        id: 'mp5',
        question: 'What happens to the decision boundaries in a multi-class SVM using an RBF kernel?',
        options: [
          'They remain strictly linear planes',
          'They form smooth piecewise non-linear boundaries separating each class region',
          'They become concentric spheres centered at the origin',
          'All boundaries disappear',
        ],
        correctIndex: 1,
        explanation:
          'The combination of pairwise or OvR RBF decision boundaries partitions the input feature space into distinct, non-linear Voronoi-like decision regions.',
      },
    ],
    codeTemplate: '',
    references: [
      {
        title: 'A Comparison of Methods for Multiclass Support Vector Machines',
        authors: 'Chih-Wei Hsu & Chih-Jen Lin (IEEE TNN 2002)',
        description: 'Comprehensive benchmark showing why One-vs-One is competitive and effective.',
        url: 'https://www.csie.ntu.edu.tw/~cjlin/papers/multisvm.pdf',
      },
      {
        title: 'On the Algorithmic Implementation of Multiclass Kernel-based Vector Machines',
        authors: 'Koby Crammer & Yoram Singer (JMLR 2001)',
        description: 'Pioneering work on all-in-one multi-class SVM formulations.',
      },
    ],
  },

  // ─── EXPERIMENT 5: Support Vector Regression (SVR) ──────────────────────────
  {
    id: 'svr',
    number: 5,
    title: 'Support Vector Regression (SVR) & ε-Insensitive Tube',
    shortTitle: '5. Support Vector Regression (SVR)',
    description:
      'Adapt SVM principles to continuous function approximation. Learn how the ε-insensitive loss function creates a margin tube around the regression curve where errors are ignored, ensuring model sparsity and robustness against outliers.',
    iconName: 'TrendingUp',
    color: '#818cf8',
    defaultParams: {
      C: 1.0,
      kernelType: 'rbf',
      gamma: 0.5,
      degree: 3,
      coef0: 0,
      epsilon: 0.2,
    },
    datasetPresets: [
      { name: 'Linear Trend', iconName: 'TrendingUp', generate: generateDiagonal },
      { name: 'Non-Linear Curve', iconName: 'Moon', generate: generateMoons },
      { name: 'Clean Separable Trend', iconName: 'Compass', generate: generateLinear },
    ],
    features: ['margin', 'contour', 'kernel-switch', 'c-slider', 'gamma-slider', 'epsilon-slider', 'regression'],
    simulationInstructions: {
      objective:
        'Understand how the ε-insensitive tube creates a margin of tolerance around the regression function, ensuring that minor noise incurs zero penalty.',
      userActions: [
        'Load the "Non-Linear Curve" preset to see continuous data points.',
        'Adjust the "ε (Epsilon Tube)" slider to expand or contract the insensitive margin tube around the curve.',
        'Notice how data points inside the tube are ignored by the optimizer (αᵢ = 0), while points outside become support vectors.',
        'Tweak the C parameter to see how strictly the tube penalizes points that escape outside.',
      ],
      visualElements: [
        {
          name: 'Regression Curve',
          visual: 'Solid Emerald Line',
          meaning: 'The continuous function f(x) = Σ (αᵢ - αᵢ*) K(xᵢ, x) + b fitted to the data.',
        },
        {
          name: 'Epsilon Tube Envelope',
          visual: 'Dashed Lines at f(x) ± ε',
          meaning: 'Tolerance zone. Points within this tube have zero loss and do not become support vectors.',
        },
        {
          name: 'Upper Slack (ξᵢ)',
          visual: 'Points above f(x) + ε',
          meaning: 'Positive residual error penalizing the objective by C · ξᵢ.',
        },
        {
          name: 'Lower Slack (ξᵢ*)',
          visual: 'Points below f(x) - ε',
          meaning: 'Negative residual error penalizing the objective by C · ξᵢ*.',
        },
      ],
      guidedTasks: [
        {
          id: 1,
          title: 'Observe Sparsity with Wide Tube',
          action: 'Increase ε to 0.8 or 1.0. Count the active support vectors.',
          observation: 'Most points now fit inside the wide tube, so the number of support vectors drops sharply (high sparsity).',
        },
        {
          id: 2,
          title: 'Observe Loss of Sparsity as ε → 0',
          action: 'Decrease ε to 0.05 or 0.01.',
          observation: 'Almost every single point now falls outside the tiny tube and becomes a support vector (loss of sparsity).',
        },
        {
          id: 3,
          title: 'Compare with Least Squares Regression',
          action: 'Read the theory section on squared error vs ε-insensitive loss.',
          observation: 'SVR ignores all points inside the tube and scales errors linearly outside, making it resilient to outliers.',
        },
      ],
    },
    theory: [
      {
        title: 'From Classification to Regression',
        content: `In classification, our goal was to find a hyperplane that separates two discrete classes with maximum margin.
In **Support Vector Regression (SVR)**, introduced by Vapnik in 1997, the goal is inverted:

Find a continuous function $f(\\mathbf{x}) = \\mathbf{w}^T \\phi(\\mathbf{x}) + b$ that deviates at most $\\varepsilon$ from the actual target values $y_i$ for all training points, while simultaneously being as flat as possible (minimizing $\\frac{1}{2}\\|\\mathbf{w}\\|^2$).`,
      },
      {
        title: 'The ε-Insensitive Loss Function',
        content: `Standard linear regression uses mean squared error ($L_2$ loss), which is highly sensitive to outliers. SVR introduces Vapnik\'s **$\\varepsilon$-insensitive loss**:

$$
|y - f(\\mathbf{x})|_\\varepsilon = \\begin{cases} 
0 & \\text{if } |y - f(\\mathbf{x})| \\le \\varepsilon \\\\
|y - f(\\mathbf{x})| - \\varepsilon & \\text{otherwise}
\\end{cases}
$$

### Visual Intuition: The Epsilon Tube
Imagine an envelope or tube of width $2\\varepsilon$ surrounding the predicted regression curve $f(\\mathbf{x})$:
- Any point falling **inside the tube** has zero loss and zero penalty.
- Any point falling **outside the tube** incurs a linear penalty proportional to its distance from the tube boundary.

This guarantees **sparsity**: only points lying on or outside the tube boundaries become Support Vectors!`,
      },
      {
        title: 'Primal and Dual Formulations for SVR',
        content: `To accommodate points that exceed the $\\varepsilon$ tube, two sets of slack variables are introduced:
- $\\xi_i$: Excess error above the tube ($y_i - f(\\mathbf{x}_i) > \\varepsilon$)
- $\\xi_i^*$: Excess error below the tube ($f(\\mathbf{x}_i) - y_i > \\varepsilon$)

### SVR Primal Optimization:
$$
\\min_{\\mathbf{w}, b, \\boldsymbol{\\xi}, \\boldsymbol{\\xi}^*} \\frac{1}{2} \\|\\mathbf{w}\\|^2 + C \\sum_{i=1}^N (\\xi_i + \\xi_i^*)
$$
subject to:
$$
\\begin{aligned}
y_i - \\mathbf{w}^T \\phi(\\mathbf{x}_i) - b &\\le \\varepsilon + \\xi_i \\\\
\\mathbf{w}^T \\phi(\\mathbf{x}_i) + b - y_i &\\le \\varepsilon + \\xi_i^* \\\\
\\xi_i, \\xi_i^* &\\ge 0
\\end{aligned}
$$

### SVR Dual Formulation:
$$
\\max_{\\boldsymbol{\\alpha}, \\boldsymbol{\\alpha}^*} -\\frac{1}{2} \\sum_{i,j=1}^N (\\alpha_i - \\alpha_i^*)(\\alpha_j - \\alpha_j^*) K(\\mathbf{x}_i, \\mathbf{x}_j) - \\varepsilon \\sum_{i=1}^N (\\alpha_i + \\alpha_i^*) + \\sum_{i=1}^N y_i(\\alpha_i - \\alpha_i^*)
$$
subject to:
$$
0 \\le \\alpha_i, \\alpha_i^* \\le C, \\quad \\sum_{i=1}^N (\\alpha_i - \\alpha_i^*) = 0
$$

The final regression prediction function is:
$$
f(\\mathbf{x}) = \\sum_{i=1}^N (\\alpha_i - \\alpha_i^*) K(\\mathbf{x}_i, \\mathbf{x}) + b
$$`,
      },
    ],
    preTest: [
      {
        id: 'r1',
        question: 'What is the role of parameter ε (epsilon) in Support Vector Regression?',
        options: [
          'It defines the learning rate of gradient descent',
          'It specifies the radius of the insensitive tube within which errors are ignored',
          'It sets the maximum number of iterations',
          'It controls the polynomial degree',
        ],
        correctIndex: 1,
        explanation:
          'The parameter ε defines a tolerance margin around the regression function. Data points lying inside this ε-tube incur zero loss.',
      },
      {
        id: 'r2',
        question: 'Why are points strictly inside the ε-tube NOT support vectors in SVR?',
        options: [
          'They have zero loss, so their corresponding dual multipliers αᵢ and αᵢ* are zero',
          'They are considered outliers and deleted',
          'The optimizer ignores negative values',
          'Because ε must always be zero',
        ],
        correctIndex: 0,
        explanation:
          'By the KKT complementarity conditions, points inside the tube have slack ξ = 0 and constraints are slack, requiring αᵢ = αᵢ* = 0.',
      },
      {
        id: 'r3',
        question: 'How does increasing ε affect the number of support vectors?',
        options: [
          'Decreases the number of support vectors, yielding a sparser model',
          'Increases the number of support vectors to N',
          'Has no effect on support vectors',
          'Always causes overfitting',
        ],
        correctIndex: 0,
        explanation:
          'A wider tube encompasses more data points within the zero-loss zone. Fewer points lie outside the tube, resulting in fewer support vectors and a sparser model.',
      },
      {
        id: 'r4',
        question: 'Why does SVR have two sets of slack variables (ξᵢ and ξᵢ*)?',
        options: [
          'One for training and one for testing',
          'One for positive errors (above the tube) and one for negative errors (below the tube)',
          'One for input features and one for target labels',
          'To handle multi-class targets',
        ],
        correctIndex: 1,
        explanation:
          'Because errors can occur in two directions (above the upper tube boundary or below the lower tube boundary), separate non-negative slacks ξᵢ and ξᵢ* are required.',
      },
      {
        id: 'r5',
        question: 'What advantage does ε-insensitive loss have over Ordinary Least Squares (OLS) squared loss?',
        options: [
          'It is easier to calculate analytically',
          'It is much more robust against extreme outliers and produces a sparse model',
          'It always produces a flat horizontal line',
          'It does not require tuning any hyperparameters',
        ],
        correctIndex: 1,
        explanation:
          'Squared loss heavily magnifies outliers with (y - f(x))², while ε-insensitive loss grows only linearly outside the tube and ignores noise inside the tube.',
      },
    ],
    postTest: [
      {
        id: 'rp1',
        question: 'In the SVR prediction equation f(x) = Σ (αᵢ - αᵢ*) K(xᵢ, x) + b, can both αᵢ and αᵢ* be simultaneously positive for the same point?',
        options: [
          'Yes, for all points on the regression line',
          'No, a point cannot simultaneously be above the upper tube and below the lower tube (αᵢ · αᵢ* = 0)',
          'Yes, if C is very large',
          'Only when using linear kernels',
        ],
        correctIndex: 1,
        explanation:
          'A point cannot violate both upper and lower boundaries at the same time. The KKT conditions guarantee αᵢ · αᵢ* = 0 for all i.',
      },
      {
        id: 'rp2',
        question: 'What happens to SVR as ε approaches 0?',
        options: [
          'It becomes standard L1 loss regression (Least Absolute Deviations), and almost all points become support vectors',
          'The weights w collapse to zero',
          'The margin becomes infinitely wide',
          'Training time drops to zero',
        ],
        correctIndex: 0,
        explanation:
          'When ε = 0, any deviation from the curve incurs loss. Sparsity is lost because virtually every point lies outside the tube and becomes an SV.',
      },
      {
        id: 'rp3',
        question: 'How do you control the smoothness (complexity) of a non-linear SVR curve?',
        options: [
          'Only via the learning rate',
          'By jointly tuning C (slack penalty), ε (tube width), and γ (RBF kernel bandwidth)',
          'By changing the test set size',
          'SVR curves are always linear',
        ],
        correctIndex: 1,
        explanation:
          'Smoothness is governed by C (regularization), ε (noise tolerance), and kernel parameters like γ (locality of RBF basis functions).',
      },
      {
        id: 'rp4',
        question: 'Which Scikit-Learn class implements Support Vector Regression?',
        options: ['sklearn.svm.SVC', 'sklearn.svm.SVR', 'sklearn.linear_model.Ridge', 'sklearn.svm.OneClassSVM'],
        correctIndex: 1,
        explanation:
          'Scikit-Learn provides `sklearn.svm.SVR` for regression and `sklearn.svm.SVC` for classification.',
      },
      {
        id: 'rp5',
        question: 'What is the primary difference between the support vectors in classification vs regression?',
        options: [
          'In classification, SVs define the boundary between classes; in SVR, SVs define the boundaries of the approximation tube',
          'There is no difference in their mathematical roles',
          'SVR does not use support vectors',
          'Classification SVs always have α = 0',
        ],
        correctIndex: 0,
        explanation:
          'In classification, SVs bound the separation gap between classes. In SVR, SVs are data points lying on or outside the tube that shape the regression curve.',
      },
    ],
    codeTemplate: '',
    references: [
      {
        title: 'A Tutorial on Support Vector Regression',
        authors: 'Alex J. Smola & Bernhard Schölkopf (Statistics and Computing 2004)',
        description: 'The standard reference tutorial explaining SVR theory, loss functions, and algorithms.',
        url: 'https://link.springer.com/article/10.1007/s10260-004-0094-1',
      },
      {
        title: 'Support Vector Method for Function Approximation, Regression Estimation, and Signal Processing',
        authors: 'Vladimir N. Vapnik, Steven E. Golowich, & Alex J. Smola (NIPS 1996)',
        description: 'Introduced the ε-insensitive loss function for regression.',
      },
    ],
  },
];
