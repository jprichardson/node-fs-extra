function buildPartialFs (fs, ...factories) {
  return factories.reduce(
    (partialFs, factory, i) => {
      try {
        Object.assign(partialFs, factory(fs))
      } catch (e) {
        const facString = (factory && factory.name)
          ? factory.name
          : require('util').inspect(factory)

        Error.captureStackTrace(e, buildPartialFs)
        const error = new Error(`Failure in factory #${i + 1} (${facString}): ${e.stack}`)
        Error.captureStackTrace(error, buildPartialFs)
        throw error
      }
      return partialFs
    },
    {}
  )
}

module.exports = buildPartialFs
