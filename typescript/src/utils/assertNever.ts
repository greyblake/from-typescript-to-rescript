function assertNever(value: never): never {
    throw new Error(`assertNever throwed an error on: ${value}`);
}

export { assertNever };
