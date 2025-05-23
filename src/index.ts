/**
 * @types
 * Builds tuple with specific element type and length.
 * 
 * @param T {any} Element type
 * @param L {number} Length
 * @param A {T[]} Tuple
 */
type BuildTuple<T extends any, L extends number, A extends T[] = []> = 
  A['length'] extends L ? A : BuildTuple<T, L, [...A, T]>;

/**
 * @type
 * BuildTuple variant for number.
 * 
 * @param L {number} Length of the tuple.
 */
type NumberTuple<L extends number> = BuildTuple<number, L>;

/**
 * @type
 * BuildTuple variant for number.
 * 
 * @param L {number} Length of the tuple.
 */
type StringTuple<L extends number> = BuildTuple<string, L>;

/**
 * @type
 * Get length of the static string.
 * 
 * @param S {string} 
 */
type StringLength<S extends string> = Chars<S>["length"]; 

/**
 * @type
 * Get chars of the static string.
 * 
 * @param S {string} 
 */
type Chars<S extends string, A extends any[] = []> =
  S extends `${infer C}${infer R}` ? Chars<R, [C, ...A]> : A;

/**
 * @type
 * Create combinations of the chars in one string
 * with the specific length.
 * 
 * @param R {string} Rest
 * @param D {string} Length
 * @param A {string} Current Char
 * @param C {unknown[]} Control Array
 */
type Combine<
    R extends string,
    D extends number,
    A extends string = "",
    C extends unknown[] = []
> = C['length'] extends D
    ? A 
    : (A extends "" ? never : A)
    | Combine<R, D, `${A}${R}`, [0, ...C]>;

/**
 * @type
 * Get combinations of {@link Combine}
 * 
 * @param T {string[]} Strings
 * @param D {number}   Length
 */
type Combinations<
    T extends readonly string[],
    D extends number
> = Combine<T[number], D>;

/**
 * @exports
 * 
 * @type
 * The body parameter type for VecBase variants.
 * 
 * @param D {number} Length of tuple.
 */
type VecBody<D extends number> = [number] | NumberTuple<D>;

/**
 * @exports
 * 
 * @type
 * The body parameter type for Vec2
 */
type Vec2Body = VecBody<2>;

/**
 * @exports
 * 
 * @type
 * The body parameter type for Vec3
 */
type Vec3Body = VecBody<3>;

/**
 * @exports
 * 
 * @type
 * The body parameter type for Vec4
 */
type Vec4Body = VecBody<4>;

/**
 * @exports
 * 
 * @type
 * The body parameter type for VecBase
 */
type VecBaseBody = [number] | [number, number, ...number[]];

/**
 * @exports
 * 
 * @type
 * The swizzles parameter type for VecBase
 */
type VecBaseSwizzles<B extends VecBaseBody> = 
    StringTuple<Exclude<B, [number]>["length"]>;

/**
 * @exports 
 * 
 * @type
 * The swizzles parameter type for VecBase variants.
 * 
 * @param S {readonly string[]} Swizzles
 */
type VecSwizzles<S extends readonly string[]> = {
    [P in Combinations<S, S["length"]>]:
        P extends S[number] ? number
        : StringLength<P> extends 2 ? Vec2 & VecSwizzles<typeof Vec2.swizzle_particals>
        : StringLength<P> extends 3 ? Vec3 & VecSwizzles<typeof Vec3.swizzle_particals>
        : StringLength<P> extends 4 ? Vec4 & VecSwizzles<typeof Vec4.swizzle_particals>
        : VecBase<any, any> & VecSwizzles<any>; // Hmm
};

/** 
 * @exports 
 * 
 * @class
 * @classdesc
 * Base class for N dimensional vectors.
 * 
 * Basicly, everything else in the module is a wrapper for this class.
 * 
 * All methods related to vectors are inherited from this class.
 */
class VecBase<
    B extends VecBaseBody,
    S extends readonly string[] = VecBaseSwizzles<B>,
>{
    /**
     * @private
     * @property swizzles
     * 
     * @description
     * Particals of getter and setter keys for dimensions.
     */
    private swizzles: S

    /**
     * @private
     * @property body 
     * 
     * @description
     * A storage for the vector's dimensions.
     */
    private body: B

    /**
     * @public
     * @constructor
     * 
     * @param swizzles Property value
     * @param body     Property value
     */
    constructor(swizzles: S, body: B) {
        this.swizzles = swizzles;
        this.body = body;
    }

    /**
     * @public
     * @function
     * Gets prototype of "this" and create new instance.
     * 
     * Copies structured clones of "swizzles" and "body" properities to new instance.
     *
     * @returns
     * New instance of same prototype with same values. 
     */
    public clone() {
        const prototype = Object.getPrototypeOf(this);
        const instance: typeof this = Object.create(prototype);

        instance.swizzles = structuredClone(this.swizzles);
        instance.body = structuredClone(this.body);

        return instance;
    }

    /**
     * @private
     * @function
     * To find out which index that swizzle reference on the body.
     * 
     * @param swizzle Single swizzle.
     * @returns {number} Swizzle index on the body.
     */
    private find_swizzle_index(swizzle: S[number]) {
        return this
            .swizzles
            .findIndex(
                v => swizzle === v
            );
    }

    /**
     * @public
     * @function
     * 
     * @returns {string[]} Swizzles.
     */
    public get_swizzles() {
        return this.swizzles;
    }

    /**
     * @public
     * @function
     * Get value of dimension by swizzle.
     * 
     * @param dimension {string}
     * Swizzle that reference to dimension on the body.
     * 
     * @returns {number} Value of dimension.
     */
    public get_dimension(dimension: S[number]) {
        return this.body[this.find_swizzle_index(dimension)];
    }

    /**
     * @public
     * @function
     * Set value of dimension by swizzle.
     * 
     * @param dimension {string}
     * Swizzle that reference to dimension on the body.
     * 
     * @param value {number}
     * New value of dimension
     * 
     * @returns {void}
     */
    public set_dimension(dimension: S[number], value: number) {
        this.body[this.find_swizzle_index(dimension)] = value;
    }
    
    /**
     * @private
     * @function
     * Manages operation between two vectors with the same number of dimensions.
     * 
     * Operation is handled dimension by dimension with the given callback.
     * 
     * @param other {this} Vector with the same number of dimensions.
     * @param callback {Function} The callback that will be handling the operation. 
     * 
     * @returns {this} New vector with the operation result.
     */
    private couple_element_wise(
        other: this,
        callback: (a: number, b: number) => number
    ) {
        const clone = this.clone();

        clone.body = clone.body.map(
            (v, i) => callback(v, other.body[i])
        ) as B;

        return clone;
    }

    /**
     * @public
     * @function
     * Adds values to the dimensions from dimensions of the other.
     * 
     * @param other {this} Vector with the same number of dimensions.
     * 
     * @returns {this} New vector with the result.
     */
    public add(other: this) {
        return this.couple_element_wise(other, (a, b) => a + b);
    }

    /**
     * @public
     * @function
     * Subtracts values to the dimensions from dimensions of the other.
     * 
     * @param other {this} Vector with the same number of dimensions.
     * 
     * @returns {this} New vector with the result.
     */
    public subtract(other: this) {
        return this.couple_element_wise(other, (a, b) => a - b);
    }

    /**
     * @public
     * @function
     * Divides the dimensions with dimensions of the other.
     * 
     * @param other {this} Vector with the same number of dimensions.
     * 
     * @returns {this} New vector with the result.
     */
    public divide(other: this) {
        return this.couple_element_wise(other, (a, b) => a / b);
    }
    
    /**
     * @public
     * @function
     * Multiplies the dimensions with dimensions of the other.
     * 
     * @param other {this} Vector with the same number of dimensions.
     * 
     * @returns {this} New vector with the result.
     */
    public multiply(other: this) {
        return this.couple_element_wise(other, (a, b) => a * b);
    }

    /**
     * @public
     * @function
     * Multiplies the dimensions with the number.
     * 
     * @param number {number} The number that will be multiplier. 
     *
     * @returns {this} New vector with the result.
     */
    public scalar(number: number) {
        const clone = this.clone();

        clone.body = clone.body.map(() => number) as B;

        return this.multiply(clone);
    }

    /**
     * @todo
     * @param other 
     * @param t 
     * @returns 
     */
    public lerp(other: this, t: number) {
        return this.couple_element_wise(other, (a, b) => {
            if(t > 1) return b;
            if(t < 0) return a;
            
            return a + (a + b) / 2;
        });
    }

    /**
     * @public
     * @function
     * Find the angle between the vector and the other vector.
     * 
     * @param other {this} Vector with the same number of dimensions.
     * 
     * @returns {this} Angle in radiant format.
     */
    public angle(other: this) {
        const dot_product = this.dot(other);
        const norm_product = this.norm() * other.norm();

        const cosine = dot_product / norm_product;

        return Math.acos(cosine);
    }

    /**
     * @public
     * @function
     * Get norm of the vector.
     * 
     * @returns {number} Norm of the vector
     */
    public norm() {
        const total = this.body.reduce((acc, v) => acc + v * v, 0);
        return Math.sqrt(total);
    }


    /**
     * @public
     * @function
     * Get magnitude of the vector.
     * 
     * @returns {number} Magnitude of the vector
     */
    public magnitude() {
        return this.norm();
    }

    /**
     * @public
     * @function
     * Projects the vector over the other vector.
     * 
     * @param other {this} Vector with the same number of dimensions.
     *
     * @returns {this} New vector with the result.
     */
    public projection(other: this) {
        const dot_product = this.dot(other);
        const norm_power = Math.pow(other.norm(), 2);

        const factor = dot_product / norm_power;

        return other.scalar(factor);
    }

    /**
     * @public
     * @function
     * Normalize the vector.
     * 
     * @returns {this} New vector with the result.
     */
    public normalize() {
        const norm = this.norm();

        return this.scalar(1 / norm);
    }

    /**
     * @public
     * @function
     * Get dot production of the vector and the other vector.
     * 
     * @param other {this} Vector with the same number of dimensions.
     *
     * @returns {this} New vector with the result.
     */
    public dot(other: this) {
        return this.multiply(other).body.reduce((acc, v) => acc + v);
    }

    /**
     * @public
     * @function
     * Get cross production of the vector and the other vector.
     * 
     * Both of the vectors must have exactly three dimensions,
     * otherwise function returns undefined.
     * 
     * @param other {this} Vector with three dimensions.
     *
     * @returns {this} New vector with the result.
     * @returns {undefined} undefined
     */
    public cross<
        R extends 3 extends B["length"]
            ? this
            : undefined,
    >(other: this): R {
        const dimension_count = this.body.length;

        if(dimension_count !== 3) return undefined as R;

        const values = [
            [...this.body, ...this.body],
            [...other.body, ...other.body],
        ]

        let result = [0, 0, 0];

        for(let i = 0; i < 3; i++) {
            const [i2, i3] = [1 - i, 4 - i];
            const [c1, c2] = [i, i3];

            const j = i2 < 0 ? i3 : i2;
            
            result[i] += values[0][c1 + 1] * values[1][c1 + 2];
            result[j] -= values[0][c2 - 1] * values[1][c2 - 2];
        }

        const clone = this.clone();

        clone.body = result as B;

        return clone as unknown as R;
    }
}
/**
 * @function
 * Makes proxied the vector with swizzle getters and setters.
 * 
 * This provides access to swizzle usage for the VecBase instances.
 * 
 * @param vec {VecBase} The vector that will be proxied.
 * @param swizzles {string[]} Swizzles
 * 
 * @returns {VecBase} Proxied vector.
 */
function createVecProxy<
    V extends VecBase<any, any>,
    S extends readonly string[],
>(vec: V, swizzles: S) {

    /**
     * @function
     * Check if all string is valid swizzle pattern.
     * 
     * @param val {string}
     * 
     * @returns {boolean} Status 
     */
    const swizzleMatch = (val: string[]) => swizzles.length >= val.length
        ? val.every(c => swizzles.includes(c))
        : false;

    /**
     * @function
     * Get handler of the proxy.
     * 
     * Handles usual properties and swizzle combinations.
     * 
     * If the key is valid swizzle pattern,
     * returns dimensions that are referenced by swizzles
     * with VecBase heir instance.
     * 
     * @param target {VecBase}
     * @param p {string | symbol}
     * 
     * @returns {any}
     */
    const get: ProxyHandler<V>["get"] = (target, p) => {
        if(Reflect.has(target, p))
            return target[p];

        if(typeof p !== "string") return;

        const chars = p.split("");
        
        if(!swizzleMatch(chars)) return;
        
        const result = chars.map(
            c => target.get_dimension(c)
        );

        if(result.length === 1) return result[0];

        switch (result.length) {
            case 2: return Vec2.new(...result as Vec2Body);
            case 3: return Vec3.new(...result as Vec3Body);
            case 4: return Vec4.new(...result as Vec4Body);
        }

        return createVecProxy(
            new VecBase(swizzles, result as VecBaseBody),
            swizzles,
        );
    }

    /**
     * @function
     * Get handler of the proxy.
     * 
     * Handles usual properties and swizzle combinations.
     * 
     * If the key is valid swizzle pattern,
     * sets values of the dimensions that are referenced by swizzles
     * to given values.
     * 
     * @param target {VecBase}
     * @param p {string | symbol}
     * @param value {any}
     * @param receiver {any}
     * 
     * @returns {boolean} Status 
     */
    const set: ProxyHandler<V>["set"] = (target, p, value, receiver) => {
        if(Reflect.has(target, p))
            return Reflect.set(target, p, value, receiver);

        if(typeof p !== "string") return false;
        if(!(value instanceof VecBase)) return false;

        const chars = p.split("");
        
        if(!swizzleMatch(chars)) return false;

        for(const dimension of chars) {
            const dimension_value = value.get_dimension(dimension);

            if(typeof dimension_value !== "number") return false;

            target.set_dimension(dimension, dimension_value);
        }

        return true;
    }
    
    return new Proxy(vec, { get, set }) as V & VecSwizzles<S>;
}

/**
 * @exports
 * 
 * @class
 * @extends {VecBase}
 * 
 * @classdesc
 * VecBase variant for two dimensional vectors.
 */
class Vec2 extends VecBase<Vec2Body> {
    public static swizzle_particals = ["x", "y"] as const;

    /**
     * @deprecated Swizzle usage not supported.
     * @function
     * Create new instance of Vec2.
     * 
     * @param body {Vec2Body}
     */
    public constructor(...body: Vec2Body) {
        super(Vec2.swizzle_particals as StringTuple<2>, body);
    }

    /**
     * @function
     * Create new instance of Vec2 with swizzle support.
     * 
     * @param body {Vec2Body} 
     * @returns {VecSwizzles} Two dimensional vector
     */
    static new = (...body: Vec2Body) => createVecProxy(
        new Vec2(...body),
        Vec2.swizzle_particals
    );
}

/**
 * @exports
 * 
 * @class
 * @extends {VecBase}
 * 
 * @classdesc
 * VecBase variant for three dimensional vectors.
 */
class Vec3 extends VecBase<Vec3Body> {
    public static swizzle_particals = ["x", "y", "z"] as const;

    /**
     * @deprecated Swizzle usage not supported.
     * @function
     * Create new instance of Vec3.
     * 
     * @param body {Vec2Body}
     */
    public constructor(...body: Vec3Body) {
        super(Vec3.swizzle_particals as StringTuple<3>, body);
    }

    /**
     * @function
     * Create new instance of Vec3 with swizzle support.
     * 
     * @param body {Vec3Body} 
     * @returns {VecSwizzles} Three dimensional vector
     */
    static new = (...body: Vec3Body) => createVecProxy(
        new Vec3(...body),
        Vec3.swizzle_particals
    );
}

/**
 * @exports
 * 
 * @class
 * @extends {VecBase}
 * 
 * @classdesc
 * VecBase variant for four dimensional vectors.
 */
class Vec4 extends VecBase<Vec4Body> {
    public static swizzle_particals = ["x", "y", "z", "w"] as const;

    /**
     * @deprecated Swizzle usage not supported.
     * @function
     * Create new instance of Vec4.
     * 
     * @param body {Vec2Body}
     */
    public constructor(...body: Vec4Body) {
        super(Vec4.swizzle_particals as StringTuple<4>, body);
    }

    /**
     * @function
     * Create new instance of Vec4 with swizzle support.
     * 
     * @param body {Vec4Body} 
     * @returns {VecSwizzles} Four dimensional vector
     */
    static new = (...body: Vec4Body) => createVecProxy(
        new Vec4(...body),
        Vec4.swizzle_particals
    );
}

const _default = {
    VecBase,
    Vec2,
    Vec3,
    Vec4,
}

export {
    VecBase,
    Vec2,
    Vec3,
    Vec4,
}

export type {
    VecBody,
    VecBaseBody,
    Vec2Body,
    Vec3Body,
    Vec4Body,
    VecSwizzles,
    VecBaseSwizzles,
}

export default _default;
