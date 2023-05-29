# Evaluation

To evaluate our tool, we computed the bus factor of 935 popular repositories on GitHub.
Datasets are available in [`data`](./data) directory.

The whole process is implemented using jupyter notebooks:
1. [`Prepare data`](Prepare%20data.ipynb): loads the most starred repos using GraphQL API
2. [`Run benchmark`](Run%20benchmark.ipynb): loads the dataset and executes the bus factor analysis for each repo 10 times and collects the runtime metrics
3. [`Process results`](Prepare%20data.ipynb): loads a CSV with benchmark data and plots a scatter chart based on analysis median time.
