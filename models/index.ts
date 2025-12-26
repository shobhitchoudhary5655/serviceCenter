// Import all models to ensure they're registered in correct order
// This is critical for Next.js serverless functions

// Import base models first (no dependencies)
import './User';
import './Staff';

// Import models that depend on User/Staff
import './Service';
import './Stock';
import './ServiceProduct';
import './Invoice';
import './Event';

// Re-export models for convenience
export { default as User } from './User';
export { default as Staff } from './Staff';
export { default as Service } from './Service';
export { default as Stock } from './Stock';
export { default as ServiceProduct } from './ServiceProduct';
export { default as Invoice } from './Invoice';
export { default as Event } from './Event';

