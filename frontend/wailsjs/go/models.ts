export namespace main {
	
	export class CategoryResponse {
	    id: string;
	    name: string;
	    type: string;
	    color: string;
	    icon: string;
	    parent_id: string;
	    is_active: boolean;
	    created_at: string;
	    updated_at: string;
	
	    static createFrom(source: any = {}) {
	        return new CategoryResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.type = source["type"];
	        this.color = source["color"];
	        this.icon = source["icon"];
	        this.parent_id = source["parent_id"];
	        this.is_active = source["is_active"];
	        this.created_at = source["created_at"];
	        this.updated_at = source["updated_at"];
	    }
	}
	export class CategorySummary {
	    category: string;
	    type: string;
	    count: number;
	    total_amount: number;
	
	    static createFrom(source: any = {}) {
	        return new CategorySummary(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.category = source["category"];
	        this.type = source["type"];
	        this.count = source["count"];
	        this.total_amount = source["total_amount"];
	    }
	}
	export class PaymentMethodResponse {
	    id: string;
	    name: string;
	    description: string;
	    is_active: boolean;
	    created_at: string;
	    updated_at: string;
	
	    static createFrom(source: any = {}) {
	        return new PaymentMethodResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.is_active = source["is_active"];
	        this.created_at = source["created_at"];
	        this.updated_at = source["updated_at"];
	    }
	}
	export class TransactionResponse {
	    id: string;
	    type: string;
	    description: string;
	    amount: number;
	    transaction_date: string;
	    category: string;
	    category_id: string;
	    tags: string[];
	    customer_vendor: string;
	    payment_method: string;
	    payment_method_id: string;
	    payment_status: string;
	    reference_number: string;
	    invoice_number: string;
	    notes: string;
	    attachments: string[];
	    tax_amount: number;
	    discount_amount: number;
	    net_amount: number;
	    currency: string;
	    exchange_rate: number;
	    is_recurring: boolean;
	    recurring_frequency: string;
	    recurring_end_date: string;
	    parent_transaction_id: string;
	    created_by: string;
	    created_at: string;
	    updated_at: string;
	
	    static createFrom(source: any = {}) {
	        return new TransactionResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.type = source["type"];
	        this.description = source["description"];
	        this.amount = source["amount"];
	        this.transaction_date = source["transaction_date"];
	        this.category = source["category"];
	        this.category_id = source["category_id"];
	        this.tags = source["tags"];
	        this.customer_vendor = source["customer_vendor"];
	        this.payment_method = source["payment_method"];
	        this.payment_method_id = source["payment_method_id"];
	        this.payment_status = source["payment_status"];
	        this.reference_number = source["reference_number"];
	        this.invoice_number = source["invoice_number"];
	        this.notes = source["notes"];
	        this.attachments = source["attachments"];
	        this.tax_amount = source["tax_amount"];
	        this.discount_amount = source["discount_amount"];
	        this.net_amount = source["net_amount"];
	        this.currency = source["currency"];
	        this.exchange_rate = source["exchange_rate"];
	        this.is_recurring = source["is_recurring"];
	        this.recurring_frequency = source["recurring_frequency"];
	        this.recurring_end_date = source["recurring_end_date"];
	        this.parent_transaction_id = source["parent_transaction_id"];
	        this.created_by = source["created_by"];
	        this.created_at = source["created_at"];
	        this.updated_at = source["updated_at"];
	    }
	}
	export class TransactionStats {
	    total_income: number;
	    total_expenses: number;
	    net_profit: number;
	    total_transactions: number;
	    total_income_count: number;
	    total_expense_count: number;
	    average_transaction: number;
	    pending_income: number;
	    pending_expenses: number;
	
	    static createFrom(source: any = {}) {
	        return new TransactionStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.total_income = source["total_income"];
	        this.total_expenses = source["total_expenses"];
	        this.net_profit = source["net_profit"];
	        this.total_transactions = source["total_transactions"];
	        this.total_income_count = source["total_income_count"];
	        this.total_expense_count = source["total_expense_count"];
	        this.average_transaction = source["average_transaction"];
	        this.pending_income = source["pending_income"];
	        this.pending_expenses = source["pending_expenses"];
	    }
	}

}

export namespace models {
	
	export class User {
	    id: string;
	    name: string;
	    email: string;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new User(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.email = source["email"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class UserCreateRequest {
	    name: string;
	    email: string;
	
	    static createFrom(source: any = {}) {
	        return new UserCreateRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.email = source["email"];
	    }
	}
	export class UserUpdateRequest {
	    name?: string;
	    email?: string;
	
	    static createFrom(source: any = {}) {
	        return new UserUpdateRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.email = source["email"];
	    }
	}

}

export namespace services {
	
	export class CreateCategoryParams {
	    Name: string;
	    Type: string;
	    Color: string;
	    Icon: string;
	    ParentID: string;
	    IsActive: boolean;
	
	    static createFrom(source: any = {}) {
	        return new CreateCategoryParams(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Type = source["Type"];
	        this.Color = source["Color"];
	        this.Icon = source["Icon"];
	        this.ParentID = source["ParentID"];
	        this.IsActive = source["IsActive"];
	    }
	}
	export class CreateTransactionParams {
	    type: string;
	    description: string;
	    amount: number;
	    transaction_date: string;
	    category: string;
	    tags: string[];
	    customer_vendor: string;
	    payment_method: string;
	    payment_status: string;
	    reference_number: string;
	    invoice_number: string;
	    notes: string;
	    attachments: string[];
	    tax_amount: number;
	    discount_amount: number;
	    currency: string;
	    exchange_rate: number;
	    is_recurring: boolean;
	    recurring_frequency: string;
	    recurring_end_date: string;
	    parent_transaction_id: string;
	    created_by: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateTransactionParams(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.description = source["description"];
	        this.amount = source["amount"];
	        this.transaction_date = source["transaction_date"];
	        this.category = source["category"];
	        this.tags = source["tags"];
	        this.customer_vendor = source["customer_vendor"];
	        this.payment_method = source["payment_method"];
	        this.payment_status = source["payment_status"];
	        this.reference_number = source["reference_number"];
	        this.invoice_number = source["invoice_number"];
	        this.notes = source["notes"];
	        this.attachments = source["attachments"];
	        this.tax_amount = source["tax_amount"];
	        this.discount_amount = source["discount_amount"];
	        this.currency = source["currency"];
	        this.exchange_rate = source["exchange_rate"];
	        this.is_recurring = source["is_recurring"];
	        this.recurring_frequency = source["recurring_frequency"];
	        this.recurring_end_date = source["recurring_end_date"];
	        this.parent_transaction_id = source["parent_transaction_id"];
	        this.created_by = source["created_by"];
	    }
	}
	export class ListTransactionParams {
	    created_by: string;
	    from_date: string;
	    to_date: string;
	    type: string;
	    category: string;
	    payment_status: string;
	    customer_vendor: string;
	    search: string;
	    limit: number;
	    offset: number;
	
	    static createFrom(source: any = {}) {
	        return new ListTransactionParams(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.created_by = source["created_by"];
	        this.from_date = source["from_date"];
	        this.to_date = source["to_date"];
	        this.type = source["type"];
	        this.category = source["category"];
	        this.payment_status = source["payment_status"];
	        this.customer_vendor = source["customer_vendor"];
	        this.search = source["search"];
	        this.limit = source["limit"];
	        this.offset = source["offset"];
	    }
	}
	export class StatsParams {
	    created_by: string;
	    from_date: string;
	    to_date: string;
	
	    static createFrom(source: any = {}) {
	        return new StatsParams(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.created_by = source["created_by"];
	        this.from_date = source["from_date"];
	        this.to_date = source["to_date"];
	    }
	}
	export class UpdateCategoryParams {
	    Name: string;
	    Type: string;
	    Color: string;
	    Icon: string;
	    ParentID: string;
	    IsActive: boolean;
	
	    static createFrom(source: any = {}) {
	        return new UpdateCategoryParams(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Type = source["Type"];
	        this.Color = source["Color"];
	        this.Icon = source["Icon"];
	        this.ParentID = source["ParentID"];
	        this.IsActive = source["IsActive"];
	    }
	}
	export class UpdateTransactionParams {
	    type: string;
	    description: string;
	    amount: number;
	    transaction_date: string;
	    category: string;
	    tags: string[];
	    customer_vendor: string;
	    payment_method: string;
	    payment_status: string;
	    reference_number: string;
	    invoice_number: string;
	    notes: string;
	    attachments: string[];
	    tax_amount: number;
	    discount_amount: number;
	    currency: string;
	    exchange_rate: number;
	    is_recurring: boolean;
	    recurring_frequency: string;
	    recurring_end_date: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateTransactionParams(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.description = source["description"];
	        this.amount = source["amount"];
	        this.transaction_date = source["transaction_date"];
	        this.category = source["category"];
	        this.tags = source["tags"];
	        this.customer_vendor = source["customer_vendor"];
	        this.payment_method = source["payment_method"];
	        this.payment_status = source["payment_status"];
	        this.reference_number = source["reference_number"];
	        this.invoice_number = source["invoice_number"];
	        this.notes = source["notes"];
	        this.attachments = source["attachments"];
	        this.tax_amount = source["tax_amount"];
	        this.discount_amount = source["discount_amount"];
	        this.currency = source["currency"];
	        this.exchange_rate = source["exchange_rate"];
	        this.is_recurring = source["is_recurring"];
	        this.recurring_frequency = source["recurring_frequency"];
	        this.recurring_end_date = source["recurring_end_date"];
	    }
	}

}

