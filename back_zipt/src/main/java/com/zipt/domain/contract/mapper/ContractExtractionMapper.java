package com.zipt.domain.contract.mapper;

import com.zipt.domain.contract.dto.*;
import com.zipt.domain.contract.entity.*;
import com.zipt.domain.contract.util.ContractUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ContractExtractionMapper {

    private final ContractUtil contractUtil;

    public void applyToContract(
            Contract contract,
            ContractExtractionResponse response
    ) {
        PropertyExtract property = response.property();
        PaymentExtract payment = response.payment();
        PeriodExtract period = response.leasePeriod();
        TaxAndPriorityExtract tax = response.taxAndPriority();
        RepairExtract repair = response.repair();

        contract.applyStructuredExtraction(
                contractUtil.parseEnum(ContractType.class, response.contractType(), ContractType.UNKNOWN),
                contractUtil.parseEnum(ContractKind.class, response.contractKind(), ContractKind.UNKNOWN),

                property != null ? property.address() : null,
                property != null ? property.buildingStructure() : null,
                property != null ? property.buildingPurpose() : null,
                property != null ? property.leasedPart() : null,

                payment != null ? payment.depositAmount() : null,
                payment != null ? payment.contractAmount() : null,
                payment != null ? payment.intermediateAmount() : null,
                payment != null ? payment.intermediatePaymentDate() : null,
                payment != null ? payment.balanceAmount() : null,
                payment != null ? payment.balancePaymentDate() : null,
                payment != null ? payment.monthlyRent() : null,
                payment != null ? payment.monthlyRentPaymentDay() : null,

                payment != null
                        ? contractUtil.parseEnum(MaintenanceFeeType.class, payment.maintenanceFeeType(), MaintenanceFeeType.UNKNOWN)
                        : MaintenanceFeeType.UNKNOWN,
                payment != null ? payment.maintenanceFeeAmount() : null,
                payment != null ? payment.maintenanceFeeCalculationMethod() : null,

                period != null ? period.deliveryDate() : null,
                period != null ? period.endDate() : null,

                tax != null
                        ? contractUtil.parseEnum(DisclosureStatus.class, tax.unpaidTaxStatus(), DisclosureStatus.UNKNOWN)
                        : DisclosureStatus.UNKNOWN,
                tax != null ? tax.unpaidTaxDescription() : null,
                tax != null
                        ? contractUtil.parseEnum(PriorityFixedDateStatus.class, tax.priorityFixedDateStatus(), PriorityFixedDateStatus.UNKNOWN)
                        : PriorityFixedDateStatus.UNKNOWN,
                tax != null ? tax.priorityFixedDateDescription() : null,

                repair != null
                        ? contractUtil.parseEnum(RepairNeededStatus.class, repair.repairNeededStatus(), RepairNeededStatus.UNKNOWN)
                        : RepairNeededStatus.UNKNOWN,
                repair != null ? repair.repairContent() : null,
                repair != null ? repair.repairCompletionDate() : null,
                repair != null ? repair.repairDefaultHandling() : null,

                response.confidence(),
                contractUtil.toJson(response.warnings()),
                contractUtil.toJson(response.missingFields())
        );

        contract.clearSpecialTerms();

        if (response.specialTerms() != null) {
            int order = 1;

            for (SpecialTermExtract term : response.specialTerms()) {
                contract.addSpecialTerm(
                        ContractSpecialTerm.builder()
                                .content(term.content())
                                .termType(contractUtil.parseEnum(
                                        SpecialTermType.class,
                                        term.termType(),
                                        SpecialTermType.UNKNOWN
                                ))
                                .tenantProtective(term.tenantProtective())
                                .needsReview(term.needsReview())
                                .displayOrder(order++)
                                .build()
                );
            }
        }
    }
}
